import "./AdminOrders.css";
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
//services
import { getSessionFromStorage } from '../services/SessionServices';
//context
import { MainContext, useContext } from '../components/Context';
//components
import OrderList from '../components/OrderList';
import DisplayIcon from '../components/DisplayIcon';
import RequestsSlider from "../components/RequestsSlider";
import TabBar from "../components/TabBar";
//icons
import { arrowBackOutline } from "ionicons/icons";


const AdminOrders = () => {

  const history = useHistory();
  const {loggedIn, setLoggedIn, currentPageDetails, setCurrentPageDetails,
        axios, rootURL, headers, setHeaders} = useContext(MainContext);
  const [orderItems, setOrderItems] = useState<any>([]);
  const [tableIds, setTableIds] = useState<number[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [sliderActive, setSliderActive] = useState<boolean>(false);

  const checkSession = async () => {
    const res = await getSessionFromStorage();
    if(res){
      if (res.status===200){
        setLoggedIn(true);
        setHeaders(res.headers);
        setCurrentPageDetails((prevDetails: any)=>{
          return{
            ...prevDetails,
            "shop_id" : res.data.shop_id
          }
        })
      }
      else{
        setCurrentPageDetails((prevDetails:any)=>{
          return{
            ...prevDetails,
            page: "/login"
          }
        })
        history.push("/login");
      }
    }else{
      setCurrentPageDetails((prevDetails:any)=>{
        return{
          ...prevDetails,
          page: "/login"
        }
      })
      history.push("/login");
    }
  }

  const getOrderItems = async (shop_id:any, headers: any) => {
    try{
      const res = await axios.get(rootURL+`/shops/${shop_id}/order_items`,{
        headers: headers
      });
      setOrderItems(res.data);
      setTableIds(getTablesWhichOrdered(res.data));
    }
    catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
      } else {
        console.log('unexpected error: ', error);
      }
    }
  }

  const getTablesWhichOrdered = (items:any) => {
    let tableIds: number[] = [];
    items.forEach((order: any) => {
        if(!tableIds.includes(order.table_id)){
            tableIds.push(order.table_id)
        }
    });
    return tableIds;
}

  const getRequests = async () => {
    if(currentPageDetails.shop_id === null){
      return;
    }
    try{
      const res = await axios.get(rootURL+`/shops/${currentPageDetails.shop_id}/requests`,{
        headers: headers
      });
      setRequests(res.data);
    }
    catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
      } else {
        console.log('unexpected error: ', error);
      }
    }
  }

  useEffect(()=>{
    if(currentPageDetails.page.includes("admin")){
      checkSession();
    }
  },[currentPageDetails.page])

  useEffect(()=>{
    if(loggedIn && currentPageDetails.page==="/admin/orders"){
      getOrderItems(currentPageDetails.shop_id, headers);
      getRequests();
    }
  },[currentPageDetails])

  const goBackToRoot = () => {
    setCurrentPageDetails((prevDetails: any)=>{
        return{
            ...prevDetails,
            page: "/welcome"
        }
    });
    history.push("/welcome");
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonButton onClick={goBackToRoot}>
              <IonIcon icon={arrowBackOutline}></IonIcon>
            </IonButton>
            <IonTitle className="font-inter" >Orders</IonTitle>
            <button onClick={()=>setSliderActive((prev: boolean)=> !prev)} className="requests-slider-btn">
              {requests.length>0 && <div className="notifications">{requests.length}</div>}
              <DisplayIcon icon="requestWaiterIcon" fill="var(--ion-color-dark-shade)"/>
            </button>
        </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="font-inter" fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Orders</IonTitle>
          </IonToolbar>
        </IonHeader>
        <OrderList orderItems={orderItems}
                    tableIds={tableIds}
                    getOrderItems={getOrderItems}/>
        {!orderItems[0] && <h2 className="no-items">There are no orders waiting for delivery.</h2>}

        <RequestsSlider 
          sliderActive={sliderActive}
          requests={requests}
          getRequests={getRequests}
        />

        <TabBar page="/admin/orders"/>
      </IonContent>
    </IonPage>
  )
}
export default AdminOrders;