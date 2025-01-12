import re
from routes.chatbot_helper.ticket_helper import museumStrength, create_order

async def customResponse(user_state, user_states, user_id, message):
    # Set default state if not available
    user_state = user_states.get(user_id, {
        'awaiting_confirmation': False,
        'no_of_tickets': False,
        'class_selection': False,  # Added for class selection
        'payment_confirmation': False,
        'no_of_tickets_value': 0,
        'selected_class': '',  # Added for storing selected class
        'ticket_price': 0  # Added for storing ticket price
    })

    # Step 1: Handle Booking Confirmation
    if user_state['awaiting_confirmation']:
        if 'yes' in message.lower() or 'ok' in message.lower():
            user_states[user_id] = {
                'awaiting_confirmation': False,
                'no_of_tickets': False,
                'class_selection': True,  # Proceed to class selection
                'payment_confirmation': False,
                'no_of_tickets_value': 0,
                'selected_class': '',
                'ticket_price': 0
            }
            return {'user': 'bot', 'type': 'message', 'message': 
                "Please select a class for booking: \n"
                "1. Premium Class: ₹8000 per ticket\n"
                "2. First Class: ₹5000 per ticket\n"
                "3. Second Class: ₹3500 per ticket\n"
                "4. Third Class: ₹2000 per ticket\n"
                "Enter the class name (e.g., 'Premium', 'First', 'Second', 'Third') to continue."}

        elif 'no' in message.lower():
            user_states[user_id] = {
                'awaiting_confirmation': False,
                'no_of_tickets': False,
                'class_selection': False,
                'payment_confirmation': False,
                'no_of_tickets_value': 0,
                'selected_class': '',
                'ticket_price': 0
            }
            return {'user': 'bot', 'type': 'message', 'message': "Okay, let me know if you need anything else."}

        else:
            return {'user': 'bot', 'type': 'message', 'message': 
                "To continue with the booking process please respond with 'yes' to continue or 'no' to cancel the process."}

    # Step 2: Handle Class Selection
    if user_state['class_selection']:
        class_choice = message.lower()  # Convert to lower case for uniform handling
        if class_choice in ['premium', 'first', 'second', 'third']:
            # Map class to price
            class_prices = {
                'premium': 8000,
                'first': 5000,
                'second': 3500,
                'third': 2000
            }
            selected_price = class_prices[class_choice]
            
            # Update user state with selected class and price
            user_states[user_id] = {
                'awaiting_confirmation': False,
                'no_of_tickets': True,  # Proceed to ticket number selection
                'class_selection': False,
                'payment_confirmation': False,
                'no_of_tickets_value': 0,
                'selected_class': class_choice.capitalize(),  # Store class with proper case
                'ticket_price': selected_price  # Store the ticket price
            }
            return {'user': 'bot', 'type': 'message', 'message': 
                f"You selected {class_choice.capitalize()} Class. The price per ticket is ₹{selected_price}.\n"
                "How many tickets would you like to book?"}
        
        else:
            return {'user': 'bot', 'type': 'message', 'message': 
                "Please select a valid class ('Premium', 'First', 'Second', 'Third') or type 'cancel' to cancel the booking."}

    # Step 3: Handle Number of Tickets
    if user_state['no_of_tickets']:
        if 'cancel' in message.lower():
            user_states[user_id] = {
                'awaiting_confirmation': False,
                'no_of_tickets': False,
                'class_selection': False,
                'payment_confirmation': False,
                'no_of_tickets_value': 0,
                'selected_class': '',
                'ticket_price': 0
            }
            return {'user': 'bot', 'type': 'message', 'message': "Booking has been cancelled."}

        try:
            no_of_tickets = int(message)
            if no_of_tickets <= 0:
                raise ValueError

            response = await museumStrength(no_of_tickets, 600)
            if response:
                # Proceed to payment confirmation
                user_states[user_id] = {
                    'awaiting_confirmation': False,
                    'no_of_tickets': False,
                    'class_selection': False,
                    'payment_confirmation': True,
                    'no_of_tickets_value': no_of_tickets,
                    'selected_class': user_state['selected_class'],
                    'ticket_price': user_state['ticket_price']
                }

                # Calculate total cost based on selected class and ticket number
                cost = no_of_tickets * user_state['ticket_price']
                return {'user': 'bot', 'type': 'message', 'message': 
                    f"The requested amount of tickets is available. The cost of the tickets for {user_state['selected_class']} Class would be ₹{cost}.\n"
                    "Please enter 'yes' to proceed to payment or 'cancel' to cancel the booking."}

            else:
                user_states[user_id] = {
                    'awaiting_confirmation': False,
                    'no_of_tickets': False,
                    'class_selection': False,
                    'payment_confirmation': False,
                    'no_of_tickets_value': 0,
                    'selected_class': '',
                    'ticket_price': 0
                }
                return {'user': 'bot', 'type': 'message', 'message': "The museum is full right now. Please try again later."}

        except ValueError:
            return {'user': 'bot', 'type': 'message', 'message': "Please enter a valid number of tickets or type 'cancel' to cancel the booking."}

    # Step 4: Handle Payment Confirmation
    if user_state['payment_confirmation']:
        if 'cancel' in message.lower():
            user_states[user_id] = {
                'awaiting_confirmation': False,
                'no_of_tickets': False,
                'class_selection': False,
                'payment_confirmation': False,
                'no_of_tickets_value': 0,
                'selected_class': user_state['selected_class'],
                'ticket_price': 0
            }
            return {'user': 'bot', 'type': 'message', 'message': "Booking has been cancelled."}

        try:
            if 'yes' in message.lower() or 'ok' in message.lower():
                no_of_tickets = user_state['no_of_tickets_value']
                selected_class = user_state['selected_class']
                user_states[user_id] = {
                    'awaiting_confirmation': False,
                    'no_of_tickets': False,
                    'class_selection': False,
                    'payment_confirmation': False,
                    'no_of_tickets_value': 0,
                    'selected_class': '',
                    'ticket_price': 0
                }
               
                data = await create_order(user_id, no_of_tickets,selected_class)
                
                return {'user': 'bot', 'type': 'order_id', 'message': data}
            else:
                return {'user': 'bot', 'type': 'message', 'message': "Please enter a valid response."}

        except Exception as e:
            print(e)
            user_states[user_id] = {
                'awaiting_confirmation': False,
                'no_of_tickets': False,
                'class_selection': False,
                'payment_confirmation': False,
                'no_of_tickets_value': 0,
                'selected_class': '',
                'ticket_price': 0
            }
import re

def checkBookWithQnty(s):
    pattern = r'\{book_ticket,(\d+)\}' 
    match = re.search(pattern, s)
    if match:
        return int(match.group(1))
    return None
