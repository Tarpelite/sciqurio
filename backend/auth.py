import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from authing.v2.authentication import AuthenticationClient, AuthenticationClientOptions

# Authing configuration
AUTHING_APP_ID = os.environ.get("AUTHING_APP_ID", "68035ccfc5f4309865cede03")
AUTHING_APP_HOST = os.environ.get("AUTHING_APP_HOST", "https://sciqurio.authing.cn")
AUTHING_APP_SECRET = os.environ.get("AUTHING_APP_SECRET", "3bb3d4af285c98c6992de345bbbeb126")

# Security scheme
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify the token and return the user.
    This function will be used as a dependency in protected endpoints.
    """
    token = credentials.credentials

    # Initialize Authing client with the token
    try:
        authentication_client = AuthenticationClient(
            options=AuthenticationClientOptions(
                app_id=AUTHING_APP_ID,
                app_host=AUTHING_APP_HOST,
                token=token
            )
        )
        # Get current user from token
        user = authentication_client.get_current_user()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
