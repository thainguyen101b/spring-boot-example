# Spring Boot Example

## how `server.forward-headers-strategy=native` works with security oauth2 client

## Mô tả

Tôi đang chạy một Nginx với vai trò là một reverse proxy, các thông tin của nó bao gồm:

```json
{
  "host": "localhost",
  "port": 80,
  "scheme": "http"
}
```

Tôi có một ứng dụng Spring Boot với các deps:

* spring-boot-starter-web
* spring-boot-starter-oauth2-client

Và các thông tin của nó bao gồm:

```json
{
  "host": "localhost",
  "port": 8081,
  "scheme": "http"
}
```

## Yêu cầu

Vì chạy sau reverse-proxy, người dùng không quan tâm và không biết được spring boot thực sự là gì, chạy ở đâu.
Họ chỉ biết public là reverse proxy, tức http://localhost

Trong reverse proxy, tôi đã cấu hình `proxy-pass` tới spring boot như sau:

```text
location / {
    proxy_pass	http://localhost:8081;
    proxy_set_header	Host $host;
    proxy_set_header	X-Real-IP $remote_addr;
    proxy_set_header	X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header	X-Forwarded-Proto $scheme;
}
```

Khi đã gắn đủ các header X-Forwarded-* như kia, và `server.forward-headers-strategy=native`. Ứng dụng sẽ work!

Bằng cách truy cập từ reverse proxy http://localhost/oauth2/authorization/{registrationId} nó sẽ chuyển tới spring boot
với url sau
http://localhost:8081/oauth2/authorization/{registrationId}. Và spring boot sẽ chuyển hướng tới trang login của Identity
provider với
param `&redirect_uri=http://localhost/login/oauth2/code/{registrationId}`.

## Lưu ý

Bằng việc dùng `server.forward-headers-strategy=native`, Spring Boot sẽ dùng native support từ các web-server như
Tomcat. Vấn đề là `X-Forwarded-Prefix` không được hỗ trợ tự động. Chính vì thế ví dụ này chỉ hoạt động nếu spring boot
được serve ở root `/` và không có base path nào.

## Demo
1. http://localhost/redirect-me
2. http://localhost/oauth2/authorization/springbootexample

auth url: http://localhost/auth/realms/springbootexample/protocol/openid-connect/auth?response_type=code&client_id=spring-boot-example&scope=openid&state=NVOI0XOKZa_gMFxX8YgdPEXJPXlc5j_7yyqiqksyF5U%3D&redirect_uri=http://localhost/login/oauth2/code/springbootexample&nonce=UpLx-iiwmaSLv4xRgMBMUihggAtSwE9tptTJYEnjBUY

## Refs
* [oauth2-login](https://docs.spring.io/spring-security/reference/reactive/oauth2/login/core.html)
* [http-proxy-server](https://docs.spring.io/spring-security/reference/features/exploits/http.html#http-proxy-server)
* [Running Behind a Front-end Proxy Server](https://docs.spring.io/spring-boot/how-to/webserver.html#howto.webserver.use-behind-a-proxy-server)