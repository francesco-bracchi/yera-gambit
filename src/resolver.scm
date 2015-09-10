(##namespace ("yera-resolver#"))

(##include "~~lib/gambit#.scm")
(include "~~ehwas/ehwas#.scm")

(include "parser#.scm")

(declare (standard-bindings)
         (extended-bindings)
         (fixnum)
         (block))

(define (fold-left f i l)
  (let fold ((i i) (l l))
    (if (null? l) i
        (fold (f i (car l)) (cdr l)))))

(define (yerac cwd in out)
  (yera->js cwd in out))

(define (yerabc cwd in out)
  (write (yera->bytecode cwd in) out))

(define (last l)
  (cond
   ((null? l) '())
   ((null? (cdr l)) (car l))
   (else (last (cdr l)))))

(define (yera root)
  (lambda (request)
    (let((path (uri-path (http-request-uri request)))
         (version (http-request-version request)))
      (cond
       ((null? path) #f)
       ((string-ci=? (path-extension (symbol->string (last path))) ".yera")
        (with-fields
         request (action type)
         (let((full (fold-left
                     (lambda (dir v) (string-append dir "/" (symbol->string v)))
                     root
                     path)))
           (cond
            ((not action)
             (make-javascript-response version 200 "OK" full))
            ((string=? action "code")
             (cond
              ((not type) (raise "type not found"))
              ((string=? type "bytecode")
               (make-bytecode-response version 200 "OK" full))
              ((string=? type "ecmascript")
               (make-javascript-response version 200 "OK" full))
              (else (error (string-append "type " type " not available")))))
            (else (error (string-append "action " action  " not available")))))))
       (else #f)))))

(define buffer-size (make-parameter (* 10 1024)))

(define (make-bytecode-response v c s full)
  (http-response
   version: v
   code: c
   status: s
   header: `((content-type . "text/plain")
             (pragma . "no-cache"))
   body: (lambda (out) 
           (call-with-input-file full
             (lambda (in)
               (yerabc (path-directory full) in out))))))

(define (make-javascript-response v c s full)
  (http-response
   version: v
   code: c
   status: s
   header: `((content-type . "text/ecmascript")
             (pragma .  "no-cache"))
   body: (lambda (out)
           (call-with-input-file full
             (lambda (in)
               (yerac (path-directory full) in out))))))
  

