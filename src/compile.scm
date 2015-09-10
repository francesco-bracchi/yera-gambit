(##namespace ("yera-compile#"))

(##include "~~lib/gambit#.scm")
(include "mangle#.scm")

(define-macro (test s)
  (let(
       (vv (gensym 'vv)))
  `(lambda (,vv) (and (pair? ,vv) (eq? (car ,vv) (quote ,s))))))

(define-macro (emit p . es)
  (let(
       (_p (gensym '_p)))
    `(let(
          (,_p ,(car p)))
       ,@(map (lambda (e) `(print port: ,_p ,e)) es))))
  
(define let? (test let))
(define lambda? (test lambda))
(define object? (test obj))
(define array? (test arr))
(define call? pair?)
(define struct? (test struct))
(define interface? (test interface))
(define javascript? (test javascript)) 
;; (define box? (test box))
;; (define unbox? (test unbox))
(define (true? e) (eq? e 'true))
(define (false? e) (eq? e 'false))
(define (undefined? e) (eq? e 'undefined))
(define (ynull? e) (eq? e 'null))

(define (expr-compile e p)
  (cond
   ((javascript? e) (javascript-compile e p))
   ((array? e) (array-compile e p))
   ((object? e) (object-compile e p))
;;    ((box? e) (box-compile e p))
;;    ((unbox? e) (unbox-compile e p))
   ((let? e) (let-compile e p))
   ((lambda? e) (lambda-compile e p))
   ((struct? e) (struct-compile e p))
   ((interface? e) (interface-compile e p))
   ((call? e) (call-compile e p))
   ((true? e) (value-compile e p))
   ((false? e) (value-compile e p))
   ((ynull? e) (value-compile e p))
   ((undefined? e) (value-compile e p))
   ((symbol? e) (symbol-compile e p))
   ((string? e) (value-compile e p))
   ((number? e) (value-compile e p))
   (else (error "Unknown element in the ast" e))))

(define (bindings-compile e p)
  (for-each
   (lambda (b)
     (cond
      ((eq? (car b) 'open) (open-compile b p))
      (else (assignment-compile b p))))
   e))

(define (let-compile e p)
  (emit (p) "function(){")
  (bindings-compile (cadr e) p)
  (emit (p) "return ")
  (expr-compile (caddr e) p)
  (emit (p) "}()"))

(define (assignment-compile e p)
  (emit (p) "var " (mangle (car e)) "=")
  (expr-compile (cadr e) p)
  (emit (p) ";"))

(define (lambda-compile e p) 
  (let(
       (formals (cadr e)))
    (emit (p)
          "function(" (mangle (car formals))
          (map (lambda (s) `("," ,(mangle s))) (cdr formals))
          "){ return ")
    (expr-compile (caddr e) p)
    (emit (p) "}")))

(define (array-compile e p)
  (emit (p) "[")
  (if (null? (cdr e)) '()
      (let ()
        (expr-compile (cadr e) p)
        (for-each (lambda (j)
                    (emit (p) ",")
                    (expr-compile j p))
                  (cddr e))))
  (emit (p) "]"))

(define (object-compile e p)
  (emit (p) "{")
  (if (null? (cdr e)) '()
      (let ()
        (emit (p) (caadr e) ":")
        (expr-compile (cadadr e) p)
        (for-each (lambda (j)
                    (emit (p) "," (car j) ":")
                    (expr-compile (cadr j) p))
                  (cddr  e))))
  (emit (p) "}"))

(define (javascript-compile e p)
  (emit (p) "(" (cadr e) ")"))

(define (symbol-compile e p)
  (emit (p) (mangle e)))

(define (value-compile e p) (write e p))

(define (call-compile e p)
  (let(
       (bindings (cdr e)))
    (expr-compile (car e) p)
    (emit (p) "(")
    (expr-compile (car bindings) p)
    (for-each (lambda (b) (emit (p) ",") (expr-compile b p)) (cdr bindings))
    (emit (p) ")")))

(define (open-compile e p)
  (emit (p) "var $$op=")
  (expr-compile (cadr e) p)
  (emit (p) ";")
  (emit (p) "for(var $$k in $$op.bindings)eval('var '+$$k+'=$$op.bindings[\"'+$$k+'\"]');"))

(define (interface-compile e p)
  (emit (p) "new Interface([")
  (if (null? (cdr e)) '()
      (let ()
        (emit (p) "\"" (mangle (cadr e)) "\"")
        (for-each (lambda (j)
                    (emit (p) ",")
                    (emit (p) "\"" (mangle j) "\""))
                  (cddr e))))
  (emit (p) "])"))

;; TODO make struct of type [symbols] x [values] instead of [symbols] x {symbols -> values}
(define (struct-compile e p)
  (emit (p) "function(){")
  (bindings-compile (caddr e) p)
  (emit (p) "var $$st={};" "var $$in=") (expr-compile (cadr e) p) (emit (p) ";")
  (emit (p)
        "for(var $$j=0;$$j<$$in.symbols.length;$$j++)$$st[$$in.symbols[$$j]]=eval($$in.symbols[$$j]);"
        "return new Struct ($$in, $$st);"
        "}()"))
