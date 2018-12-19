// This code contains a crude parser for experssion and inequality
// ### I assume the inputs has satisfied the format convention!!! ###

/*
Format Convention:
CFG : Varialble: {I, E, T, D, V}, Character Set: {[a-z], [0-9], +, -, <=, space}
I: ineqality, E: expression, T: term, D: number, V: variable
P:
    I  -> E <= D
    E  -> T + E | T - E
    E  -> T
    T  -> V
    T  -> D V
    V  -> [a-z]
    D  -> \d+ | -\d+

Or in human language:
    1. Only "<=" sign, no "<" or "="
    2. The name of variable should be a single lowercase english letter, i.e. [a-z]
    3. No parentheses
    4. Only "+"/"-", no "*" or "/" in the expression
    5. The RHS of the inequality should only contains ONE number
    6. The LHS should be an expression:
    7. Space between ceofficient, varialbe or operator will be ignored
    8. The objective function should also in follow convention of expression
*/
class Parser {
    // "exp" is an expression in String, without inequality sign

    parseExpression(exp) {
        exp.replace(" ", ""); // TODO: Now I simply delete all the space, may fix later
        var op_re = /\+|-/;
        var term_array = exp.split(op_re);
        var op_array = exp.match(/\+|-/g);
        if (op_array == null)
            op_array = []
        //console.log(term_array);
        var sgn = 1;
        var num_array = [], var_array = [];
        console.assert(term_array.length == op_array.length + 1)
        for (var i = 0; i < term_array.length; i++) {
            if (term_array[i] != "") {
                var num_i = term_array[i].match(/\d+/)
                if (num_i == null)
                    num_i = 1
                else
                    num_i = num_i[0].valueOf()
                num_i = num_i * sgn;
                var var_i = term_array[i].match(/[a-z]+/)
                num_array.push(num_i)
                var_array.push(var_i)
            }
            if (i < op_array.length) {
                if (op_array[i] == "+")
                    sgn = 1;
                else
                    sgn = -1;
            }
        }
        return [num_array, var_array]
    }

    parseInequality(ineq) {
        var tmp = ineq.split("<="), exp, rhs;
        exp = tmp[0];
        rhs = tmp[1].valueOf();
        tmp = this.parseExpression(exp);
        tmp.push(rhs);
        return tmp;
    }

    // "state_object" is directly from `this.state` in "handleSubmit" from ProblemFactory.js
    parseObject(state_object) {
        var n = 0,
            m, a = new Array(),
            b,
            c;
        var i, j, var_name;
        this.occur_map = {}; // just like the "map" in c++
        this.remap = {};
        m = state_object.constraints.length;
        // Step1: parse all varialbe, and renumber them
        var var_list = state_object.objective.match(/[a-z]+/g)
        for (i = 0; i < var_list.length; i++) {
            var_name = var_list[i]
            this.occur_map[var_name] = 1;
        }
        for (j = 0; j < m; j++) {
            var cons = state_object.constraints[j];
            var_list = cons.match(/[a-z]+/g);
            for (i = 0; i < var_list.length; i++) {
                var_name = var_list[i]
                this.occur_map[var_name] = 1;
            }
        }
        for (var keys in this.occur_map)
            if (this.occur_map.hasOwnProperty(keys)) {
                this.remap[keys] = n;
                n++;
            }
        //console.log(this.remap);
        
        // Step2: parse these expression and fill the array
        var rel = this.parseExpression(state_object.objective);
        var num_array = rel[0], var_array = rel[1]
        //console.log(num_array)
        //console.log(var_array)
        c = new Array(n).fill(0)
        b = new Array(m).fill(0)

        for (i = 0; i < num_array.length; i++) {
            c[this.remap[var_array[i]]] += num_array[i];
        }
        for (j = 0; j < m; j++) {
            var cons = state_object.constraints[j];
            rel = this.parseInequality(cons);
            var num_array = rel[0], var_array = rel[1];
            b[j] = parseInt(rel[2]);
            var ta = new Array(n).fill(0);
            for (i = 0; i < num_array.length; i++)
                ta[this.remap[var_array[i]]] += num_array[i];
            a = a.concat(ta);
        }
        //console.log([n, m, a, b, c])
        return {
            n: n,
            m: m,
            a: a,
            b: b,
            c: c
        }
    }
    reverseParseExp(n, num_array) {
        var i, exp = "", flag = 0;
        for (i = 0; i < n; i++) {
            if(num_array[i] == 0)
                continue;
            else if(num_array[i] > 0 && flag)
                exp += "+";
            flag = 1;
            if(num_array[i] != 1 && num_array[i] != -1)
                exp += num_array[i].toString() + String.fromCharCode(i+97);
            else if(num_array[i] == 1)
                exp += String.fromCharCode(i+97);
            else
                exp += "-" + String.fromCharCode(i+97);
        }
        return exp;
    }

    reverseParseObject(n, m, a, b, c) {
        console.assert(n > 0);
        console.assert(m >= 0);
        console.assert(a.length === n * m);
        console.assert(b.length === m);
        console.assert(c.length === n);
        console.assert(n <= 26);
        var state_object = {
            constraints: new Array(m),
            objective: ""
        };
        state_object.objective = this.reverseParseExp(n, c);
        var i;
        for(i=0;i<m;i++) {
            state_object.constraints[i] = this.reverseParseExp(n, a.slice(i*n, (i+1)*n)) + " <=" + b[i].toString();
        }
        return state_object;
    }

}

export default Parser;