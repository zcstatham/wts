/**
 * GJK原理:
 * 如果两个凸图形的闵可夫斯基差包含原点, 那么这两个图形重叠.
 * 问题转变成判断一个闵可夫斯基差图形是否包含原点.
 * 闵可夫斯基和就是把两个图形里的点都当作向量, 把两个图形里的向量点都分别相加, 得到一个新的图形.
 * 闵可夫斯基差就是把其中一个图形的向量都取反, 相当于绕原点反转, 然后再把两个图形求闵可夫斯基和.
 */
class GJK {
    static intersect(s1,s2){
        //取一向量,获得交点A
        let d = new Vector2D(1,0),
            simplexA = GJK.Support(s1,s2,d);
        if(Vector2D.Pmul(simplexA,d)<0){
            return false;
        }
        //向量取反,获得交点B
        d = Vector2D.negative(d);
        let simplexB= GJK.Support(s1,s2,d);
        if(Vector2D.Pmul(simplexB,d)<0){
            return false;
        }
        //A向量取反,AB向量，法线向量
        let ao = Vector2D.negative(simplexA),
            ab = Vector2D.Sub(simplexB,simplexA);
        d = Vector2D.Triple(ab,ao);

        //循环查找点，判断差
        while(true){
            let simplexC = GJK.Support(s1,s2,d);
            if(Vector2D.Pmul(simplexC,d)<0){
                return false;
            }else{
                let ba= Vector2D.Sub(simplexA,simplexB),
                    ac = Vector2D.Sub(simplexC,simplexA),
                    bc = Vector2D.Sub(simplexC,simplexB),
                    nac = Vector2D.Triple(ac,ab),
                    nbc = Vector2D.Triple(bc,ba);
                //点积为负,未相交
                if(Vector2D.Pmul(nac,simplexA)<0){
                    simplexB = simplexC;
                    d = Vector2D.negative(nac);
                }else if(Vector2D.Pmul(nbc,simplexB)<0){
                    simplexA = simplexC;
                    d = Vector2D.negative(nbc);
                }else {
                    return true;
                }
            }
        }
    }

    private static Support(shape1, shape2, d) {
        //d是向量方向（不必归一化）
        //在相反方向上获得形状的边缘点
        let p1 = GJK.GetFarthestPointInDirection(shape1,d);
        let p2 = GJK.GetFarthestPointInDirection(shape2,d.negative());
        // 执行闵可夫斯基差值 返回即闵可夫斯基空间边上的闵可夫斯基空间中的一个点
        return Vector2D.Sub(p1,p2);
    }

    private static GetFarthestPointInDirection(shape: any,vector: Vector2D): Vector2D {
        if(shape[0].constructor.name!='Vector2D'&&Object.keys(shape[0]).length===3){
            return GJK.GetFarthestPointInDirectionInCircle(shape,vector)
        }else {
            return GJK.GetFarthestPointInDirectionInPolygon(shape,vector)
        }
    }

    private static GetFarthestPointInDirectionInPolygon(shape: Vector2D[], vector: Vector2D): Vector2D{
        let curr = shape[0], //检测点
            bestProjection: number = Vector2D.Pmul(curr, vector), //最远点
            projection:number;

        for(let i in shape){
            curr = shape[i];
            projection = Vector2D.Pmul(curr, vector);
            if(projection > bestProjection)
                bestProjection = projection
        }
        return curr
    }

    private static GetFarthestPointInDirectionInCircle(circle: any, vector: Vector2D): Vector2D{
        let unit = Vector2D.Unit(vector);
        return new Vector2D(unit.x*circle.r,unit.y*circle.r)
    }
}

class Vector2D{
    public x:number;
    public y:number;
    public constructor(x,y){
        this.x = x;
        this.y = y;
    }

    /**
     * 取反
     * @param {Vector2D} a
     * @returns {Vector2D}
     */
    static negative(a:Vector2D){
        return new Vector2D(-a.x,-a.y);
    }

    /**
     * 单位向量
     * @param {Vector2D} a
     * @returns {Vector2D}
     * @constructor
     */
    static Unit(a:Vector2D){
        let len2 = Math.pow(Vector2D.Len(a),2);
        return new Vector2D(a.x*len2,a.y*len2)
    }
    /**
     * 向量加法 返回被加数向量起点指向加数向量终点的向量
     * @param {Vector2D} a
     * @param {Vector2D} b
     * @returns {Vector2D}
     */
    static Add(a:Vector2D,b:Vector2D){
        return new Vector2D(a.x+b.x,a.y+b.y)
    }

    /**
     * 向量减法 返回从差向量终点指向被减向量终点的向量
     * @param {Vector2D} a
     * @param {Vector2D} b
     * @returns {Vector2D}
     */
    static Sub(a:Vector2D,b:Vector2D){
        return new Vector2D(a.x-b.x,a.y-b.y)
    }

    /**
     * 向量点乘
     * @param {Vector2D} a
     * @param {Vector2D} b
     * @returns {number}
     * @constructor
     */
    static Pmul(a:Vector2D,b:Vector2D){
        return a.x*b.x+a.y*b.y
    }

    /**
     * 向量叉乘
     * @param {Vector2D} a
     * @param {Vector2D} b
     * @returns {number}
     * @constructor
     */
    static Xmul(a:Vector2D,b:Vector2D){
        return a.x*b.y - b.x*a.y
    }

    /**
     * 向量的长度
     * @param {Vector2D} a
     * @returns {number}
     * @constructor
     */
    static Len(a:Vector2D){
        return Math.sqrt(Vector2D.Pmul(a,a))
    }

    /**
     * 向量的夹角
     * @param {Vector2D} a
     * @param {Vector2D} b
     * @returns {number}
     * @constructor
     */
    static Ang(a:Vector2D,b:Vector2D){
        return Math.acos(Math.sqrt(Vector2D.Pmul(a,b))/Vector2D.Len(a)/Vector2D.Len(b))
    }

    /**
     * 两个向量组成的三角形的面积
     * @param {Vector2D} a
     * @param {Vector2D} b
     * @returns {number}
     * @constructor
     */
    static Area(a:Vector2D,b:Vector2D){
        return Vector2D.Xmul(a,b)/2
    }

    /**
     * 将向量旋转rad度
     * @param {Vector2D} a
     * @param {number} rad
     * @returns {Vector2D}
     * @constructor
     */
    static Rotate(a:Vector2D,rad:number){
        return new Vector2D(a.x*Math.cos(rad)-a.y*Math.sin(rad),a.x*Math.sin(rad)-a.y*Math.cos(rad))
    }

    /**
     * 求向量的单位法线
     * @param {Vector2D} a
     * @returns {Vector2D}
     * @constructor
     */
    static Normal(a:Vector2D){
        let len = Vector2D.Len(a);
        return new Vector2D(-a.y/len,a.x/len)
    }

    /**
     * 垂直与a向量,指向b向量方向的向量
     * @param {Vector2D} a 基准向量
     * @param {Vector2D} b 方向向量
     * @returns {Vector2D}
     * @constructor
     */
    static Triple(a:Vector2D,b:Vector2D):Vector2D{
        let x = -(a.x*b.y-a.y*b.x)*a.y,
            y = (a.x*b.y-a.y*b.x)*a.x;
        return new Vector2D(x,y)
    }
    // tripleProduct*(v1, v2, v3: Vector2D): Vector2D =
    //     result.x = -(v1.x * v2.y - v1.y * v2.x) * v3.y
    // result.y = (v1.x * v2.y - v1.y * v2.x) * v3.x
}