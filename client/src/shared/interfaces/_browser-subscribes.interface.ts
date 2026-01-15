export interface IBrowserSubscribeResponse {
  /**
   * The unique identifier for the subscription.
   * @type {string}
   */
  id: string;

  /**
   * The push service URL for sending notifications.
   * @type {string}
   */
  endpoint: string;

  /**
   * The expiration time of the subscription, if any.
   * @type {string}
   */
  expirationTime: string;

  /**
   * The client's public key for encryption (P-256 elliptic curve).
   * @type {string}
   */
  p256dh: string;

  /**
   * The authentication secret for the push subscription.
   * @type {string}
   */
  auth: string;
}