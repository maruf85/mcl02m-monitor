import { IonApp, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import Dashboard from './pages/Dashboard';

export default function App() {
  return <IonApp><IonPage>
    <IonHeader translucent><IonToolbar><IonTitle>MCL02M Monitor</IonTitle></IonToolbar></IonHeader>
    <IonContent fullscreen><Dashboard /></IonContent>
  </IonPage></IonApp>;
}