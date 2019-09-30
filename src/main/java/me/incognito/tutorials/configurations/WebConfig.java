package me.incognito.tutorials.configurations;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.View;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.view.BeanNameViewResolver;
import org.thymeleaf.spring5.SpringTemplateEngine;
import org.thymeleaf.spring5.templateresolver.SpringResourceTemplateResolver;
import org.thymeleaf.spring5.view.ThymeleafViewResolver;
import org.thymeleaf.templatemode.TemplateMode;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lombok.extern.slf4j.Slf4j;
import me.incognito.tutorials.common.view.TestView;
import nz.net.ultraq.thymeleaf.LayoutDialect;

/**
 * Create by incognito on 2019-09-26
 */
@Configuration
public class WebConfig extends WebMvcConfigurationSupport {
    private static final String CLASSPATH_RESOURCE_LOCATIONS = "classpath:/static/";

    @Bean
    public ViewResolver beanNameViewResolver() {
        final BeanNameViewResolver resolver = new BeanNameViewResolver();
        resolver.setOrder(1);
        return resolver;
    }

    @Bean
    public View etView() {
        return new TestView();
    }

    //////////////////////////////////////////////
    ///     Start: Interceptor Configurations  ///
    //////////////////////////////////////////////

    // Internationalization Configuration
    @Bean
    public HandlerInterceptor localeChangeInterceptor() {
        final LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang");
        return interceptor;
    }

    @Bean
    public HandlerInterceptor customInterceptor() {
        return new CustomInterceptor();
    }
    //////////////////////////////////////////////
    ///     End: Interceptor Configurations    ///
    //////////////////////////////////////////////

    //////////////////////////////////////////////
    ///     Start: Thymeleaf Configurations    ///
    //////////////////////////////////////////////

    // Thymeleaf Template Configuration
    @Bean
    public SpringResourceTemplateResolver templateResolver() {
        SpringResourceTemplateResolver  templateResolver = new SpringResourceTemplateResolver ();
        templateResolver.setPrefix("classpath:templates/");
        templateResolver.setCharacterEncoding("UTF-8");
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode(TemplateMode.HTML);
//        templateResolver.setTemplateMode("LEGACYHTML5");
        templateResolver.setCacheable(false);
        return templateResolver;
    }
    // Thymeleaf Dialect Configuration (Using Template layout)
    @Bean
    public LayoutDialect layoutDialect() {
        return new LayoutDialect();
    }
    // Thymeleaf Template Engine Configuration
    @Bean
    @Lazy
    public SpringTemplateEngine templateEngine(final MessageSource messageSource) {
        final SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(templateResolver());
        templateEngine.setTemplateEngineMessageSource(messageSource);
        templateEngine.addDialect(layoutDialect());
        return templateEngine;
    }
    // Thymeleaf ViewResolver configuration
    @Bean
    public ViewResolver viewResolver(final MessageSource messageSource) {
        final ThymeleafViewResolver resolver = new ThymeleafViewResolver();
        resolver.setTemplateEngine(templateEngine(messageSource));
        resolver.setCharacterEncoding("UTF-8");
        resolver.setOrder(3);
        return resolver;
    }
    //////////////////////////////////////////////
    ///     End: Thymeleaf Configurations      ///
    //////////////////////////////////////////////

    @Override
    public void addResourceHandlers(final ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**").addResourceLocations(CLASSPATH_RESOURCE_LOCATIONS + "assets/").setCachePeriod(31536000);
        registry.addResourceHandler("/vendor/**").addResourceLocations(CLASSPATH_RESOURCE_LOCATIONS + "vendor/").setCachePeriod(31536000);
        registry.addResourceHandler("/html/**").addResourceLocations(CLASSPATH_RESOURCE_LOCATIONS + "html/").setCachePeriod(31536000);
    }

    @Override
    public void addViewControllers(final ViewControllerRegistry registry) {
        /*공통*/
//        registry.addViewController("/exampleLayout").setViewName("index");
    }

    @Override
    protected void addInterceptors(final InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
        registry.addInterceptor(customInterceptor()).addPathPatterns("/log/**");
    }
}

@Slf4j
class CustomInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(final HttpServletRequest request, final HttpServletResponse response, final Object handler) throws Exception {
        log.info("============ {}#preHandle() ============\nReq: {}\nRes: {}\nHandler: {}", this.getClass().getSimpleName(), request, response, handler);
        return true;
    }
}
