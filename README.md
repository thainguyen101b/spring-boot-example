# Spring Boot Example

## how `server.forward-headers-strategy=framework` works with security oauth2 client

#### Reverse proxy

```text
server {
    listen       80;
    server_name  localhost;

    location / {
        root   html;
        index  index.html index.htm;
    }
    
    location /app/ {
        proxy_pass http://localhost:8081/;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_set_header X-Forwarded-Prefix /app;
    }
    
    location /auth/ {
        proxy_pass	http://localhost:8080/;
    }
}
```

#### Spring Boot

```properties
server.port=8081
server.forward-headers-strategy=framework
spring.security.oauth2.client.registration.springbootexample.client-id=spring-boot-example
spring.security.oauth2.client.registration.springbootexample.client-secret=secret
spring.security.oauth2.client.registration.springbootexample.scope[0]=openid
spring.security.oauth2.client.registration.springbootexample.provider=keycloak
spring.security.oauth2.client.provider.keycloak.issuer-uri=http://localhost/auth/realms/springbootexample
```

#### Test

Khi truy cập url http://localhost/app/oauth2/authorization/springbootexample, nginx sẽ proxy pass tới spring boot với
url http://localhost:8081/oauth2/authorization/springbootexample.

Và với header `X-Forwarded-Prefix` được thiết lập là `/app`, và cơ chế tự động cấu hình bean `ForwardedHeaderFilter`.

Spring Boot tự động tạo `redirect-uri` một cách chính xác dựa vào reverse-proxy, cụ thể là:
http://localhost/app/login/oauth2/code/springbootexample
