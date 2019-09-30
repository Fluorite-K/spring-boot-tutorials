package me.incognito.tutorials.beans.order_1.sub;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;
import me.incognito.tutorials.beans.Prop;

/**
 * Create by incognito on 2019-09-12
 */
@Component
@Slf4j
public class PasswordProp implements Prop {
    public PasswordProp() {
        log.info("********************************************************");
        log.info("Create Bean: {}", PasswordProp.class.getSimpleName());
        log.info("********************************************************");
    }

    @Override
    public String getValue() {
        return "PWD#001";
    }
}
