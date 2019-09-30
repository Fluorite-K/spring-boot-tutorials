package me.incognito.tutorials.beans.order_1;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;
import me.incognito.tutorials.beans.Prop;

/**
 * Create by incognito on 2019-09-12
 */
@Component
@Slf4j
@Order(3) // Not Creation order, Injection order
public class IdProp implements Prop {
    public IdProp() {
        log.info("********************************************************");
        log.info("Create Bean: {}", IdProp.class.getSimpleName());
        log.info("********************************************************");
    }

    @Override
    public String getValue() {
        return "ID#001";
    }
}
