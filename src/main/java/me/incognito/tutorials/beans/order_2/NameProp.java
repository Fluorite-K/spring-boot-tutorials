package me.incognito.tutorials.beans.order_2;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;
import me.incognito.tutorials.beans.Prop;

/**
 * Create by incognito on 2019-09-12
 */
@Component
@Slf4j
@Order(1)
public class NameProp implements Prop {
    public NameProp() {
        log.info("********************************************************");
        log.info("Create Bean: {}", NameProp.class.getSimpleName());
        log.info("********************************************************");
    }

    @Override
    public String getValue() {
        return "Name#001";
    }
}
