import "./Item.css";
import { MainContext, useContext } from "./Context";
import { useIonToast } from "@ionic/react";
export default function Item(props: any){
    
    const [present, dismiss] = useIonToast();
    const {id, name, price, description, quantity ,items} = props; 
    
    
    const {currentOrderItems, setCurrentOrderItems, currentPageDetails, axios, rootURL,
    currentTableInfo} = useContext(MainContext);
    const {shop_id, table_id} = currentPageDetails;
    
    const theItem = currentOrderItems.find((item: any)=> {
        if(item)
            return item.id === id
    });
    const shouldShowControls = () => {
        if(theItem){
            return theItem.quantity>0
        }
    }
    const shouldRenderControls = shouldShowControls(); 

    const isItemOnStock = async (id:number) => {
        try {
            const { data, status } = await axios.get(rootURL+"/shops/"+shop_id+"/items/"+id);
            return (data.item && data.item.quantity > 0)
          }
          catch (error: any) {
            if (axios.isAxiosError(error)) {
              console.log('error message: ', error.message);
            } else {
              console.log('unexpected error: ', error);
            }
          }
    }
    const isItemSufficient = async (id:number, count: number) => {
        try {
            const { data, status } = await axios.get(rootURL+"/shops/"+shop_id+"/items/"+id);
            return (data.item.quantity > count)
        }
        catch (error: any) {
            if (axios.isAxiosError(error)) {
              console.log('error message: ', error.message);
            } else {
              console.log('unexpected error: ', error);
            }
        }
    }
    const onItemClick = async (id: number) => {
        if(!theItem || theItem.quantity < 1){
            if(shop_id === currentTableInfo.shop_id && await isItemOnStock(id)){
                const newItem = {
                    ...items.find((item: any)=>item.id===id),
                    quantity: 1
                }
                    setCurrentOrderItems((prevOrders: any) => {
                    return [
                        ...prevOrders,
                        newItem
                    ]
                })
            }else if(currentTableInfo.shop_id!==shop_id){
                present("This item is not on the menu. You are probably looking at the wrong shop's menu.", 3000);
            }else{    
                present("Item is not currently at stock.",2000);
            }
        }
    }
    const onIncrement = async (id:number)=>{
        let quantity=0;
        currentOrderItems.forEach((item:any)=>{
            if(item.id===id){quantity = item.quantity}
        });
        if(await isItemSufficient(id, quantity)){
            const newOrders = currentOrderItems.map((item: any)=>{
                if (item.id!==id){
                    return item;
                }else{
                    return {
                        ...item,
                        quantity: item.quantity+1
                    }
                }});
            setCurrentOrderItems(newOrders);
        }
        else{
            present("Item stock is not sufficient.",2000);
        } 
    }
    const onDecrement = (id: number)=>{
        const newOrders = currentOrderItems.reduce((result:any[], item: any)=>{
            if (item && item.id!==id){
                result.push(item);
            }else{
                if(item && item.quantity>1){
                    result.push({
                        ...item,
                        quantity: item.quantity-1
                    })
                }
            }
            return result;
        },[])
        setCurrentOrderItems(newOrders);
    }

    return(
        <section className="item-wrapper" onClick={()=>{onItemClick(id)}}>
            <div className="item-topline">
                <h3 className="item-name">{name}</h3>
                {shouldRenderControls &&
                <div className="controls-wrapper">
                    <div className="control-btn decrement" onClick={()=>{onDecrement(id)}} >
                        -
                    </div>
                    x{theItem && theItem.quantity}  
                    <div className="control-btn increment" onClick={()=>onIncrement(id)}>
                        +
                    </div>    
                </div>}
                <h3 className="item-price">${price}</h3>
            </div>
            {description && <h4 className="item-desc">{description}</h4>}
        </section>
    )
}