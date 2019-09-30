package me.incognito.tutorials.beans.order_1;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import java.util.List;

import javax.annotation.PostConstruct;

import lombok.extern.slf4j.Slf4j;
import me.incognito.tutorials.beans.Prop;

/**
 * Create by incognito on 2019-09-12
 */
@Configuration
@Slf4j
@Lazy
public class Z_PropTest {
    @Autowired
    List<Prop> props;

    public Z_PropTest() {
        log.info("********************************************************");
        log.info("Create Bean: {}", Z_PropTest.class.getSimpleName());
        log.info("********************************************************");
    }

    public void loggingProp() {
        props.forEach(prop -> log.info("Class: {}, Value: {}",prop.getClass().getSimpleName(), prop.getValue()));
    }
}
