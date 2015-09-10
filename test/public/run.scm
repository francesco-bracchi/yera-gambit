(load "../../src/ansuz/expressions")

(load "../../src/ehwas/server")
(load "../../src/ehwas/request")
(load "../../src/ehwas/rfc822")
(load "../../src/ehwas/rfc3986")
(load "../../src/ehwas/mime-types")
(load "../../src/ehwas/response")
(load "../../src/ehwas/query")
(load "../../src/ehwas/cookies")
(load "../../src/ehwas/websocket")
(load "../../src/ehwas/combinators")

(load "~~/site-scheme/futhark/gebo/gebo")

(load "~~/site-scheme/futhark/yera/mangle")
(load "~~/site-scheme/futhark/yera/compile")
(load "~~/site-scheme/futhark/yera/parser")
(load "~~/site-scheme/futhark/yera/resolver")

(load "~~/site-scheme/futhark/encode/uids")

(include "~~/site-scheme/futhark/ehwas/server#.scm")
(include "~~/site-scheme/futhark/ehwas/request#.scm")
(include "~~/site-scheme/futhark/ehwas/response#.scm")
(include "~~/site-scheme/futhark/ehwas/query#.scm")
(include "~~/site-scheme/futhark/ehwas/template#.scm")
(include "~~/site-scheme/futhark/ehwas/websocket#.scm")
(include "~~/site-scheme/futhark/ehwas/combinators#.scm")
(include "~~/site-scheme/futhark/ehwas/cookies#.scm")

(include "~~/site-scheme/futhark/gebo/gebo#.scm")
(include "~~/site-scheme/futhark/yera/resolver#.scm")

   
(http-service-register!
 (orelse
  (filesystem "~~/site-scheme/futhark/gebo/js")
  (filesystem "~~/site-scheme/futhark/yera/js")
  gebo-resolver
  (yera ".")
  (filesystem ".")
  (redirect "/index.html"))
 port-number: 9080)

(thread-sleep! +inf.0)