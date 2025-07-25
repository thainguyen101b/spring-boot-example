# Spring Boot Example

## how `server.forward-headers-strategy=native` works with security oauth2 client

#### Reverse proxy

> [!NOTE]
> Tùy chọn `native` sẽ không hỗ trợ header `X-Forwarded-Prefix`, [tìm hiểu thêm](https://stackoverflow.com/questions/68318269/spring-server-forward-headers-strategy-native-vs-framework)
>
> Và để native hoạt động với oauth2 client phần `redirect-uri`, có lẽ buộc phải serve Spring Boot tại `root`

```text
server {
    listen       80;
    server_name  localhost;

    location / {
        proxy_pass	http://localhost:8081;
        proxy_set_header	Host $host;
        proxy_set_header	X-Real-IP $remote_addr;
        proxy_set_header	X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header	X-Forwarded-Proto $scheme;
    }
    
    location /auth/ {
        proxy_pass	http://localhost:8080/;
    }
}
```

#### Spring Boot

```properties
server.port=8081
server.forward-headers-strategy=native

spring.security.oauth2.client.registration.springbootexample.client-id=spring-boot-example
spring.security.oauth2.client.registration.springbootexample.client-secret=secret
spring.security.oauth2.client.registration.springbootexample.scope[0]=openid
spring.security.oauth2.client.registration.springbootexample.provider=keycloak

spring.security.oauth2.client.provider.keycloak.issuer-uri=http://localhost/auth/realms/springbootexample
```

#### Test

Khi truy cập url http://localhost/oauth2/authorization/springbootexample, nginx sẽ proxy pass tới spring boot với
url http://localhost:8081/oauth2/authorization/springbootexample.

Spring Boot tự động tạo `redirect-uri` một cách chính xác dựa vào reverse-proxy, nhưng không hỗ trợ `X-Forwarded-Prefix`, cụ thể là:
http://localhost/login/oauth2/code/springbootexample

#### Refs
* [oauth2-login](https://docs.spring.io/spring-security/reference/reactive/oauth2/login/core.html)
* [http-proxy-server](https://docs.spring.io/spring-security/reference/features/exploits/http.html#http-proxy-server)
* [Running Behind a Front-end Proxy Server](https://docs.spring.io/spring-boot/how-to/webserver.html#howto.webserver.use-behind-a-proxy-server)