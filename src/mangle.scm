(##namespace ("yera-mangle#"))

(##include "~~/lib/gambit#.scm")

(declare (standard-bindings)
         (extended-bindings)
         (block)
         (not safe))

(define *-k-table-* (make-table init: #f))

(define-macro (assert-keyword! s)
  `(table-set! *-k-table-* (quote ,s)
               ,(string-append "$" (symbol->string s))))
               
(define-macro (assert-keywords! . ss)
  `(begin ,@(map (lambda (s) `(assert-keyword! ,s)) ss)))

(assert-keywords!
 if
 else
 null
 switch
 typeof
 instanceof
 undefined
 true
 false
 for
 in
 while
 do
 function
 with
 const
 var
 new
 alert
 delete
 
 ;; special yera extensions
 box
 
 par
 car
 cdr
 
 mem
 clear
 
 register
 open)

(define *-ch-table-* (make-table init: #f))

(define-macro (assert-special-char! c t)
  `(table-set! *-ch-table-* ,c (quote ,(reverse (string->list t)))))

(define-macro (assert-special-chars! . ps)
  `(begin
     ,@(map (lambda (p) `(assert-special-char! ,(car p) ,(cadr p))) ps)))

(assert-special-chars!
 (#\_ "$un")
 (#\+ "$pl")
 (#\- "$mn")
 (#\* "$st")
 (#\/ "$sl")
 (#\\ "$bs")
 (#\% "$pr")
 (#\! "$em")
 (#\? "$qm")
 (#\$ "$dl")
 (#\^ "$ex")
 (#\@ "$at")
 (#\: "$cl")
 (#\. "$dt")
 (#\| "$vb")
 (#\= "$eq")
 (#\> "$gt")
 (#\< "$lt")
 (#\& "$nd")
 (#\~ "$tl"))

(define (char-upcase? a) (and (char>=? a #\A) (char<=? a #\Z)))

(define (char-locase? a) (and (char>=? a #\a) (char<=? a #\z)))

(define (mangle s)
  (let((ch (table-ref *-k-table-* s)))
    (if ch ch
        (let mangle ((s (string->list (symbol->string s))) (r '()))
          (cond
           ((null? s)
            (list->string (reverse r)))
           ((and (eq? (car s) #\-) (not (null? (cdr s))) (char-locase? (cadr s)))
            (mangle (cons (char-upcase (cadr s)) (cddr s)) r))
           ((table-ref *-ch-table-* (car s)) =>
            (lambda (c) (mangle (cdr s) (append c r))))
           (else
            (mangle (cdr s) (cons (car s) r))))))))
