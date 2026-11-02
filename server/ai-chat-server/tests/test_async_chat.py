import inspect

from app.api.routes import chat_routes
from app.services import chat_services


def test_chat_functions_are_async():
    assert inspect.iscoroutinefunction(chat_services.start_conversation)
    assert inspect.iscoroutinefunction(chat_services.create_messages)
    assert inspect.iscoroutinefunction(chat_services.get_messages_conversation_id)
    assert inspect.iscoroutinefunction(chat_services.get_conversation)
    assert inspect.iscoroutinefunction(chat_routes.start_converstation)
    assert inspect.iscoroutinefunction(chat_routes.send_message)
    assert inspect.iscoroutinefunction(chat_routes.get_conversation)
    assert inspect.iscoroutinefunction(chat_routes.get_messages)
