from authing.v2.authentication import AuthenticationClient, AuthenticationClientOptions


def register_user():
    # Authing credentials
    app_id = '68035ccfc5f4309865cede03'
    app_host = 'https://sciqurio.authing.cn'
    email = '2301210309@stu.pku.edu.cn'
    password = 'liying521123'
    custom_data = {
        'student_id': '2301210309',
        'name': '李颖'
    }

    # Initialize the AuthenticationClient
    authentication_client = AuthenticationClient(
        options=AuthenticationClientOptions(
            app_id=app_id,
            app_host=app_host
        )
    )

    try:
        # Perform registration
        user = authentication_client.register_by_email(email=email, password=password, custom_data=custom_data)
        print("Registration successful!")
        print("User Info:", user)
    except Exception as e:
        print("Registration failed:", str(e))


if __name__ == "__main__":
    register_user()
