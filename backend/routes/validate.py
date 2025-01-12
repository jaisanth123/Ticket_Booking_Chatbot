from models.model import ValidateRequest
import razorpay
from prisma import Prisma
from routes.chatbot_helper.ticket_helper import generateTicket

class Validate():
    async def post(self, request: ValidateRequest):
        data = request.dict()

        try:
            payment_id: str = data['payment_id']
            order_id: str = data['order_id']
            razor_signature: str = data['razor_signature']

        except KeyError as e:
            return {'error': f"Missing field {str(e)}"}
        
        except Exception as e:
            return {'error': 'Razorpay validation failed'}

        try:
            # Connect to the database and fetch the order details using order_id
            prisma = Prisma()
            await prisma.connect()

            # Fetch the order by order_id to get the selected_class
            order_data = await prisma.order.find_unique(where={'order_id': order_id})

            if not order_data:
                return {'error': 'Order not found'}

            # Retrieve the selected_class from the order data
            selected_class = order_data.selected_class
            print("Selected class retrieved from the database:", selected_class)

        except Exception as e:
            return {'error': 'Error retrieving order data from database'}

        # Generate the ticket PDF with the selected class and quantity
        pdf = await generateTicket(order_data.quantity, selected_class)
        
        return {"type": "content", "message": "success", "pdf": str(pdf)}
