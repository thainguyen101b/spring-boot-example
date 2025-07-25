package com.example.springboot;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/redirect-me")
    public void redirectMe(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String target = "/check-headers";
        resp.sendRedirect(target);
    }

    @GetMapping("/check-headers")
    public Map<String, Object> checkHeaders(HttpServletRequest req) {
        Map<String, Object> headers = new HashMap<>();

        headers.put("host", req.getServerName());
        headers.put("port", req.getServerPort());
        headers.put("scheme", req.getScheme());

        return headers;
    }

}
