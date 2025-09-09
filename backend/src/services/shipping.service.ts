import axios from 'axios';
import { prisma } from '../config';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface ShippingPackage {
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface CreateShipmentData {
  orderId: number;
  pickupAddress: ShippingAddress;
  deliveryAddress: ShippingAddress;
  packages: ShippingPackage[];
  paymentMethod: 'prepaid' | 'cod';
  orderValue: number;
}

export interface ShipmentResponse {
  shipmentId: string;
  trackingNumber: string;
  awbCode: string;
  labelUrl?: string;
  status: string;
}

export interface TrackingInfo {
  status: string;
  location: string;
  estimatedDelivery: Date;
  trackingEvents: Array<{
    date: Date;
    status: string;
    location: string;
    description: string;
  }>;
}

/**
 * Shipping Service
 * Handles shipping operations with Shiprocket
 */
export class ShippingService {
  private static readonly BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
  private static readonly TOKEN_CACHE_KEY = 'shiprocket_token';
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get authentication token
   */
  private static async getAuthToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.BASE_URL}/auth/login`, {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      });

      return response.data.token;
    } catch (error) {
      console.error('Shiprocket authentication failed:', error);
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  /**
   * Create shipment
   */
  static async createShipment(data: CreateShipmentData): Promise<ShipmentResponse> {
    try {
      const token = await this.getAuthToken();

      // Prepare order items for Shiprocket
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        include: {
          user: {
            select: {
              email: true,
              phone: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const orderItems = order.orderItems.map(item => ({
        name: item.product.name,
        sku: item.product.sku || `PROD-${item.productId}`,
        units: item.quantity,
        selling_price: Number(item.unitPrice),
        discount: 0,
        tax: 0,
        hsn: '',
      }));

      const shipmentData = {
        order_id: order.orderNumber,
        order_date: order.createdAt.toISOString().split('T')[0],
        pickup_location: 'Primary',
        channel_id: process.env.SHIPROCKET_CHANNEL_ID || '',
        comment: `Order ${order.orderNumber}`,
        billing_customer_name: data.deliveryAddress.firstName + ' ' + data.deliveryAddress.lastName,
        billing_last_name: data.deliveryAddress.lastName,
        billing_address: data.deliveryAddress.address,
        billing_address_2: '',
        billing_city: data.deliveryAddress.city,
        billing_pincode: data.deliveryAddress.zipCode,
        billing_state: data.deliveryAddress.state,
        billing_country: data.deliveryAddress.country,
        billing_email: (order as any).user.email,
        billing_phone: data.deliveryAddress.phone || (order as any).user.phone || '',
        shipping_is_billing: true,
        shipping_customer_name: data.deliveryAddress.firstName,
        shipping_last_name: data.deliveryAddress.lastName,
        shipping_address: data.deliveryAddress.address,
        shipping_address_2: '',
        shipping_city: data.deliveryAddress.city,
        shipping_pincode: data.deliveryAddress.zipCode,
        shipping_state: data.deliveryAddress.state,
        shipping_country: data.deliveryAddress.country,
        shipping_email: (order as any).user.email,
        shipping_phone: data.deliveryAddress.phone || (order as any).user.phone || '',
        order_items: orderItems,
        payment_method: data.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
        shipping_charges: order.shippingAmount,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: order.discountAmount,
        sub_total: order.subtotal,
        length: data.packages[0]?.length || 10,
        breadth: data.packages[0]?.breadth || 10,
        height: data.packages[0]?.height || 10,
        weight: data.packages[0]?.weight || 0.5,
      };

      const response = await axios.post(
        `${this.BASE_URL}/orders/create/adhoc`,
        shipmentData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // TODO: Update order with tracking information when schema is updated
      // await prisma.order.update({
      //   where: { id: data.orderId },
      //   data: {
      //     shiprocketOrderId: response.data.order_id,
      //     trackingNumber: response.data.shipment_id?.toString(),
      //   },
      // });

      return {
        shipmentId: response.data.shipment_id?.toString(),
        trackingNumber: response.data.awb_code,
        awbCode: response.data.awb_code,
        labelUrl: response.data.label_url,
        status: 'created',
      };
    } catch (error) {
      console.error('Create shipment error:', error);
      throw new Error('Failed to create shipment');
    }
  }

  /**
   * Get shipment tracking
   */
  static async getTracking(awbCode: string): Promise<TrackingInfo> {
    try {
      const token = await this.getAuthToken();

      const response = await axios.get(
        `${this.BASE_URL}/courier/track/awb/${awbCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const trackingData = response.data.tracking_data;

      return {
        status: trackingData.shipment_status,
        location: trackingData.current_location || 'In Transit',
        estimatedDelivery: trackingData.edd ? new Date(trackingData.edd) : new Date(),
        trackingEvents: trackingData.track_array?.map((event: any) => ({
          date: new Date(event.date),
          status: event.status,
          location: event.location,
          description: event.activity,
        })) || [],
      };
    } catch (error) {
      console.error('Get tracking error:', error);
      throw new Error('Failed to get tracking information');
    }
  }

  /**
   * Cancel shipment
   */
  static async cancelShipment(awbCode: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();

      await axios.post(
        `${this.BASE_URL}/orders/cancel`,
        {
          awbs: [awbCode],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return true;
    } catch (error) {
      console.error('Cancel shipment error:', error);
      return false;
    }
  }

  /**
   * Generate shipping label
   */
  static async generateLabel(shipmentId: string): Promise<string> {
    try {
      const token = await this.getAuthToken();

      const response = await axios.post(
        `${this.BASE_URL}/courier/generate/label`,
        {
          shipment_id: [shipmentId],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.label_url;
    } catch (error) {
      console.error('Generate label error:', error);
      throw new Error('Failed to generate shipping label');
    }
  }

  /**
   * Get available couriers
   */
  static async getAvailableCouriers(
    pickupPincode: string,
    deliveryPincode: string,
    weight: number
  ): Promise<any[]> {
    try {
      const token = await this.getAuthToken();

      const response = await axios.get(
        `${this.BASE_URL}/courier/serviceability`,
        {
          params: {
            pickup_postcode: pickupPincode,
            delivery_postcode: deliveryPincode,
            weight: weight,
            cod: 0,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data.available_courier_companies || [];
    } catch (error) {
      console.error('Get available couriers error:', error);
      return [];
    }
  }
}