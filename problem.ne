@builtin "whitespace.ne" # `_` means arbitrary amount of whitespace
@builtin "number.ne"     # `int`, `decimal`, and `percentage` number primitives
#[Tue Aug 20 2019][Easy|Medium|Hard]:\n<body>

problemMessage -> dateTag hardTag nl body {% d => new Object({date: d[0], hardness: d[1], problem: d[3]}) %}

weekDay -> "Mon"
         | "Tue"
         | "Wed"
         | "Thu"
         | "Fri"
         | "Sat"
         | "Sun"

month   -> "Jan"
         | "Feb"
         | "Mar"
         | "Apr"
         | "May"
         | "Jun"
         | "Jul"
         | "Aug"
         | "Sep"
         | "Oct"
         | "Nov"
         | "Dec"

day     -> [0-3] [0-9] {% d => d.join('') %}

year    -> "20" [1-2] [0-9] {% d => d.join('') %}

dateTag -> "[" weekDay " " month " " day " " year "]"  {% d => d.slice(1,8).join('') %}

hardness -> "Easy" | "Medium" | "Hard"

hardTag -> "[" hardness "]" {% d => d[1].join('') %}

body    -> any:+ {% d => d[0].join("") %}

any     -> . | nl

nl      -> "\n" | "\r\n"