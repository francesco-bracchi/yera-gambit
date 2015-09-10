(load "~~ansuz/expressions")
(load "~~ehwas/ehwas")
(load "~~yera/yera")

(include "~~ehwas/ehwas#.scm")
(include "~~ehwas/errors#.scm")
(include "~~yera/resolver#.scm")

(define (with-index app)
  (lambda (request)
    (if (null? (uri-path (http-request-uri request)))
        (app (make-http-request
              (http-message-version request)
              (http-message-header request)
              (http-message-body request)
              (http-request-method request)
              (let((uri (http-request-uri request)))
                (make-uri
                 (uri-scheme uri)
                 (uri-authority uri)
                 '(index.html)
                 (uri-query uri)
                 (uri-fragment uri)))))
        (app request))))

(define app
  (orelse
   (yera "test/public/")
   (filesystem "~~yera/js")
   (with-index (filesystem "test/public"))))

(define port 6080)

(define (main)
  (http-service-register! (with-error-handler app) port-number: port)
  (display (string-append  "point your browser to http://localhost:" (number->string port)))
  (newline)
  (thread-sleep! +inf.0))
