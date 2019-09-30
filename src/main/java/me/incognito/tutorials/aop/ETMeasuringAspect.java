package me.incognito.tutorials.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

/**
 * Create by incognito on 2019-09-29
 */
@Aspect
@Component
public class ETMeasuringAspect {

    @Pointcut("@annotation(me.incognito.tutorials.aop.annotation.ElapsedTime)")
    public void timeMeasurePointCut() {}

    @Around("timeMeasurePointCut()")
    public Object around(final ProceedingJoinPoint jp) throws Throwable{
        final Logger log = LoggerFactory.getLogger(jp.getTarget().getClass());
        final StopWatch stopWatch = new StopWatch("Aspect-StopWatch");
        stopWatch.start(jp.toShortString());
        final Object result = jp.proceed();
        stopWatch.stop();
        log.info("{}\nElapsed Time: {} sec(s).\n{}", jp.toLongString(), stopWatch.getTotalTimeSeconds(), stopWatch.prettyPrint());
        return result;
    }
}
