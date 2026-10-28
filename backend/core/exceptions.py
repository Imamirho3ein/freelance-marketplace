from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        response.data = {
            "success": False,
            "error": {
                "code": response.status_code,
                "detail": response.data,
            },
        }
    else:
        response = Response(
            {"success": False, "error": {"code": 500, "detail": "Internal server error."}},
            status=500,
        )
    return response
