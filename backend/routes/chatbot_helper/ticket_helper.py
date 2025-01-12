from prisma import Prisma
import base64
import razorpay
import pyqrcode 
import datetime
from weasyprint import HTML
from io import BytesIO
import os

async def museumStrength(ticket_quantity, max):    
    try:
        prisma = Prisma()
        await prisma.connect()
        total_in_out = await prisma.ticket.find_many()
        in_total = 0
        out_total = 0

        for i in total_in_out:
            in_total += i.person_in
            out_total += i.person_out

        if((in_total-out_total) + ticket_quantity > max):
            return False
        else:
            return True
    except:
        return False

async def ticketsAvailable(max:int):
    try:
        prisma = Prisma()
        await prisma.connect()
        total_in_out = await prisma.ticket.find_many()
        in_total = 0
        out_total = 0

        for i in total_in_out:
            in_total += i.person_in
            out_total += i.person_out
        
        ticket = max - (in_total-out_total)
        print(ticket)
        if(ticket > 0 ):
            return ticket
        else:
            return None
    except:
        print("ticketsAvailable exception")
        return None

async def create_order(user_id,quantity,selected_class):
    try:        
        prisma = Prisma()
        await prisma.connect()
        client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))
        client.set_app_details({"title" : "test", "version" : "beta"})
        
        #amount = quantity *500000

        ticket_prices = {
            "Premium": 800000,  # 8000 INR
            "First": 500000,    # 5000 INR
            "Second": 350000,   # 3500 INR
            "Third": 200000,    # 2000 INR
        }
        print(selected_class)
        # Get the ticket price based on the selected_class
        if selected_class not in ticket_prices:
            raise ValueError("Invalid selected_class")

        ticket_price = ticket_prices[selected_class]
        amount = quantity * ticket_price  # Calculate total amount in paise
        
        DATA = {
            "amount":  amount,
            "currency": "INR",
            "receipt": user_id,
        }
        
        data = client.order.create(data=DATA)
        print(f"Quantity to be ordered: {quantity},{selected_class}")
        
        await prisma.order.create(data={
            'order_id' : data['id'],
            'quantity' : quantity,
            'selected_class': selected_class
        })

        return data['id']
    except Exception as e:
        print(e)

async def generateTicket(quantity,selected_class):
    try:
        prisma = Prisma() 
        await prisma.connect()
        print(f"Generating ticket with Quantity: {quantity} and Selected Class: {selected_class}")

        ticket = await prisma.ticket.create(
            data = {
                'quantity': quantity,
                'creation_time': datetime.datetime.utcnow(),
                'expiry_time' : datetime.datetime.utcnow() + datetime.timedelta(hours=12)
            }
        )

        qr = pyqrcode.create(ticket.id)
        buffer = BytesIO()
        qr.png(buffer, scale=5)
        buffer.seek(0)

        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        html_content = f"""
        <html>
        <head>
            <style>
                body {{
                    text-align: center;
                    font-family: Arial, sans-serif;
                }}
                .ticket {{
                    border: 1px solid #000;
                    padding: 20px;
                    display: inline-block;
                }}
                .qr-code {{
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="ticket">
                <h1>Ticket</h1>
                <p>Class: {selected_class}</p>  <!-- Display selected class -->
                <div class="qr-code">
                    <img src="data:image/png;base64,{img_base64}" alt="QR Code">
                </div>
                <p>Quantity: {quantity}</p>
                <p>Expiry: {ticket.expiry_time.strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
        </body>
        </html>
        """
        
        pdf = HTML(string=html_content).write_pdf()
        
        pdf_base64 = base64.b64encode(pdf).decode('utf-8')
        
        return pdf_base64
        
    except Exception as e:
        print(f"Error: {e}")
        return None
