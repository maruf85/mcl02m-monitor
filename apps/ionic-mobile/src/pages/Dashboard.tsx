import { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, IonItem, IonLabel, IonNote, IonText } from '@ionic/react';

export default function Dashboard() {
  const [ip, setIp] = useState('192.168.10.186');
  const [connected, setConnected] = useState(false);

  return <main className="dashboard">
    <section className="hero">
      <div className="eyebrow">LOCAL DEVICE · READ ONLY</div>
      <h1>Cooker status</h1>
      <p>Monitor your Mijia Induction Cooker 2 over your home Wi-Fi.</p>
    </section>

    <IonCard className="connection-card">
      <IonCardHeader><IonCardTitle>Device connection</IonCardTitle></IonCardHeader>
      <IonCardContent>
        <IonItem lines="none" className="ip-field">
          <IonLabel position="stacked">Cooker IP address</IonLabel>
          <IonInput value={ip} inputMode="text" placeholder="192.168.1.100" onIonInput={e => setIp(e.detail.value ?? '')} />
        </IonItem>
        <div className="connection-row">
          <span className={connected ? 'status-dot online' : 'status-dot'} />
          <IonText color="medium">{connected ? 'Connected' : 'Not connected'}</IonText>
          <IonButton size="small" fill="outline" onClick={() => setConnected(false)}>Disconnect</IonButton>
        </div>
        <IonNote>Protocol connection will be implemented next. This UI currently uses sample values.</IonNote>
      </IonCardContent>
    </IonCard>

    <div className="metrics-grid">
      {[
        ['Cooker state', '—', 'Waiting for data'],
        ['Heat level', '—', 'Power setting'],
        ['Time remaining', '—', 'Minutes'],
        ['Working time', '—', 'Elapsed'],
      ].map(([label, value, hint]) => <IonCard key={label} className="metric-card">
        <IonCardContent><span className="metric-label">{label}</span><strong>{value}</strong><small>{hint}</small></IonCardContent>
      </IonCard>)}
    </div>

    <IonCard className="info-card"><IonCardContent>
      <div className="section-heading">Safety mode <span className="readonly-pill">READ ONLY</span></div>
      <p>Monitoring only. This app will not start, stop, pause, or change cooker settings.</p>
    </IonCardContent></IonCard>
  </main>;
}