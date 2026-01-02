import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from './api';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private callbacks: { [event: string]: ((data: any) => void)[] } = {};

  public async startConnection(token: string) {
    if (this.connection) return;

    // Build connection
    // API_BASE_URL is typically http://localhost:5200/api
    // Hub is at http://localhost:5200/hubs/dashboard
    // We need to strip /api and append /hubs/dashboard
    const hubUrl = API_BASE_URL.replace('/api', '') + '/hubs/dashboard';

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    // Register handlers
    this.connection.on('IncidentCreated', (data) => this.trigger('IncidentCreated', data));
    this.connection.on('IncidentUpdated', (data) => this.trigger('IncidentUpdated', data));
    this.connection.on('TaskCreated', (data) => this.trigger('TaskCreated', data));
    this.connection.on('TaskUpdated', (data) => this.trigger('TaskUpdated', data));

    try {
      await this.connection.start();
      console.log('SignalR Connected.');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      // Retry logic could go here, but automatic reconnect handles drops
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  public off(event: string, callback: (data: any) => void) {
    if (!this.callbacks[event]) return;
    this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
  }

  private trigger(event: string, data: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  }

  public async stop() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}

export const signalRService = new SignalRService();
