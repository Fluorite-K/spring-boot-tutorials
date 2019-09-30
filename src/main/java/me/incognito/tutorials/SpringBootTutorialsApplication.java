package me.incognito.tutorials;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;
import me.incognito.tutorials.aop.annotation.ElapsedTime;
import me.incognito.tutorials.beans.order_1.Z_PropTest;

@SpringBootApplication
@EnableAspectJAutoProxy
public class SpringBootTutorialsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootTutorialsApplication.class, args);
    }

}

@Slf4j
@Controller
class TestController {

//    @Value("${encProp}")
//    private String prop1;
//
//    @Value("${plainProp}")
//    private String prop2;

    @Autowired
    private ApplicationContext ctx;

    @ElapsedTime
    @GetMapping({"/hello", "/log/hello"})
    public @ResponseBody Map<String, Object> hello() {
        log.info("URL: {}, Method: {}", "/hello", "TestController#hello");

        ctx.getBean(Z_PropTest.class).loggingProp(); // Lazy Loading

        return new HashMap<String, Object>() {
            {put("message", "hello");}
        };
    }

    @ElapsedTime
    @GetMapping("/")
    public String index() {
        return "index";
    }

    @ElapsedTime
    @GetMapping({"/test", "/log/test"})
    public ModelAndView modelView(final ModelAndView mav) {
        mav.setViewName("test");
//        mav.addObject("initData", new HashMap<String, Object>() {{put("age", 28); put("name", "Jane");}});
        mav.addObject("initData", new HashMap<String, Object>() {
            {
                put("user1", new User("Jacob", 35));
                put("user2", new HashMap<String, Object>() {{put("age", 28); put("name", "Jane");}});
            }
        });
        return mav;
    }

    @GetMapping("/file")
    public ModelAndView download(final ModelAndView mav) {
        mav.setViewName("etView");
        return mav;
    }
}

@Data
@AllArgsConstructor
@Setter
@Getter
@ToString
class User {
    private String name;
    private int age;
}