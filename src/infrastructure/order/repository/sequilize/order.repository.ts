import Order from "../../../../domain/checkout/entity/order";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderItem from "../.././../../domain/checkout/entity/order_item";

export default class OrderRepository implements OrderRepositoryInterface{
  async create(entity: Order): Promise<void> {
    try {
      await OrderModel.create(
        {
          id: entity.id,
          customer_id: entity.customerId,
          total: entity.total(),
          items: entity.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            product_id: item.productId,
            quantity: item.quantity,
          })),
        },
        {
          include: [{ model: OrderItemModel }],
        }
      );
    } catch (error) {
      console.log(error)
    }
    
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        where: { id: entity.id },
      }
    );
  }

  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: { id },
        rejectOnEmpty: true,
        include: ["items"],
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    const orderItems = orderModel.items.map((item) => {
      return new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity);
    })

    const order = new Order(orderModel.id, orderModel.customer_id, orderItems);
    return order;
  }

  async findAll(): Promise<Order[]> {
      const orderModels = await OrderModel.findAll( { include: ["items"] });

      const orders = orderModels.map((orderModel) => {
        const orderItems = orderModel.items.map((item) => {
          return new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity);
        })
        return new Order(orderModel.id, orderModel.customer_id, orderItems);
      })

      return orders
      
      // const orders = orderModels.map((orderModel) => {
      //   return orderModel.items.map((item) => {
      //     return new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity);
      //   })
      // })
      // const orderModelsArray = orderModels.map((orderModel) => {
      //   return new Order(orderModel.id, orderModel.customer_id, orderItems);
      // })
  }
}
