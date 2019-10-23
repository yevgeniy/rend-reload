Array.prototype.nimmsort=function(fn) {
    if (!fn)
        fn=function(a,b) {
            return a <= b;
        }
    var target=this;
    
    var subject1,subject2,x1,x2;
    var subjects=[target[0],target[1], 0, 1];
                
    while(subject1=subjects.shift(), subject2 = subjects.shift(),x1=subjects.shift(), x2=subjects.shift()) {
        if (x2 > target.length-1)
            break;
        
        if (fn(subject1, subject2))
            subjects.push(target[x1+1], target[x1+2], x1+1, x1+2);	
        else {
            var i;
            for(i = x1-1; i >=0; i--) {
                var matchup=target[i];
                if (fn(matchup, subject2)) {
                    break;
                }
            }
            target.splice(x2,1);
            
            target.splice(i+1,0,subject2);
        
            subjects.push(target[x1], target[x1+1], x1, x1+1);
        }
    }
    return this;
}

Array.prototype.nimmremoveall=function(fn_arr) {
    var _this=this;
    var fn=arguments[0].constructor==Function
        ? arguments[0]
        : (v,i)=>{
            return fn_arr.indexOf(v)>-1;
        }
        
    var toremove = this.filter(v=>fn(v));
    toremove.forEach(v=> {
        var i=_this.indexOf(v);
        _this.splice(i,1);
    });
}


Array.prototype.nimmjoin=function(...args) {
    var reflection=args[0];
    var _equiv_str=args[1];
    var _trans=args[2];
    var trans;

    var reflection, eqiv;
    switch(args.length) {
        case 1:
            equiv=function(a,b){return a===b};
            trans = function(a,b,ia,bi){return a;}
            break;
        case 2:
            equiv = _equiv_str.constructor==String
                ? function(a,b){return a[_equiv_str]===b[_equiv_str];}
                : _equiv_str;
            trans = function(a,b,ia,bi){return a;}
            break;
        case 3:
            _equiv_str === null
                ? function(a,b){return a===b}
                : _equiv_str;
            equiv = _equiv_str.constructor==String
                ? function(a,b){return a[_equiv_str]===b[_equiv_str];}
                : _equiv_str;
            trans = _trans;
            break;
        default:
            throw 'Check arguments.';
    }

    var out=[];
    this.forEach(function(a, ia) {
        reflection.forEach(function(b, ib) {
            equiv(a, b, ia, ib)
                && out.push(trans(a,b,ia,ib));
        });
    });
    return out;
}
Array.prototype.nimmunique=function(...args) {
    var reflection=args[0];
    var _equiv_str=args[1];
    
    var reflection, equiv, trans;
    switch(args.length) {
        case 1:
            equiv=function(a,b){return a===b};
            break;
        case 2:
            equiv = _equiv_str.constructor==String
                ? function(a,b){return a[_equiv_str]===b[_equiv_str];}
                : _equiv_str;
            break;
        default:
            throw 'Check arguments.';
    }
    
    var out=[];
    this.forEach(function(a, ia) {
        
        reflection.some(function(b, ib) {
            return equiv(a, b, ia, ib)
        })===false
            && out.push(a);
    });
    
    return out;
}
Array.prototype.nimmdistinct = function(...args){
    var _equiv_str=args[0];
    var equiv;
    
    switch(args.length) {
        case 0:
            equiv = function(a,b) {
                return a===b;
            }
            break;
        case 1:
            equiv = _equiv_str.constructor==String
                ? function(a,b) {
                    return a[_equiv_str]===b[_equiv_str];
                }
                : _equiv_str;	
            break;
        default:
            throw 'Check arguments.';
    }
    
    var out=[];
    this.forEach(function(a,ai) {
        var res=out.some(function(b,bi) {
            return equiv(a,b,ai,bi);
        });
        
        res===false
            && out.push(a);
    });
    return out;
}