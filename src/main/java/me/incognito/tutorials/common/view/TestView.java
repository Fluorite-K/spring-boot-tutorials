package me.incognito.tutorials.common.view;

import org.springframework.web.servlet.view.AbstractView;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * Create by incognito on 2019-09-29
 */
@Slf4j
public class TestView extends AbstractView {
    @Override
    protected void renderMergedOutputModel(Map<String, Object> model, HttpServletRequest request, HttpServletResponse response) throws Exception {
        String fileName = "test.txt";
        fileName = new String(fileName.getBytes("euc-kr"), "euc-kr");

        response.setContentType("text/csv; charset=euc-kr");
        String userAgent = request.getHeader("User-Agent");

        if (userAgent.indexOf("MSIE 5.5") >= 0) {
            response.setContentType("doesn/matter");
            response.setHeader("Content-Disposition", "filename=\"" + fileName + "\"");
        } else {
            response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
        }
        response.setHeader("Content-Transfer-Encoding", "binary");

        try (final PrintWriter pw = response.getWriter()) {
            pw.write("test1");
            pw.write("test2");
            pw.write("test3");
            pw.write("test4");
        } catch (IOException ie) {
            log.error(ie.getMessage());
        }
    }
}
