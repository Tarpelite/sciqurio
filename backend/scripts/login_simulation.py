from authing.v2.authentication import AuthenticationClient, AuthenticationClientOptions


def simulate_login():
    # Authing credentials
    app_id = '68035ccfc5f4309865cede03'
    app_host = 'https://sciqurio.authing.cn'
    email = '2301210309@stu.pku.edu.cn'
    password = 'liying521123'

    # Initialize the AuthenticationClient
    authentication_client = AuthenticationClient(
        options=AuthenticationClientOptions(
            app_id=app_id,
            app_host=app_host
        )
    )

    try:
        # Perform login
        user = authentication_client.login_by_email(email=email, password=password)
        print("Login successful!")
        print("User Info:", user)
    except Exception as e:
        print("Login failed:", str(e))


if __name__ == "__main__":
    simulate_login()
