const t_actions = [
    {name: "place", path: "src/images/place.png"},
    {name: "edge", path: "src/images/edge2.png"},
    {name: "andsplit", path: "src/images/andsplit.png"},
    {name: "dowhile", path: "src/images/loop2.png"},
    {name: "multinstance", path: "src/images/multinstance.png"},
    {name: "deletion", path: "src/images/delete.png"}
];
const ImSZ = 20;

class Transition{
    static path2name(path){
	    var a;
	    for(a=0; a < t_actions.length; a++){
	        if(path == t_actions[a].path){
		        return t_actions[a].name;
	        }
	    }
	    return '';
    }
    
    static centerComponent(comp, cwidth, cheight, cellW, cellH){
        comp.x += (cellW-cwidth)/2;
        comp.y += (cellH-cheight)/2;
    }

    getRectDimension(){
        var dim = {width: 20, height: 50};

        if(this.type == 'clock' || this.type == 'event' || this.type == 'manual')
		    dim.height = 40;
	    else if(this.type == 'asub' || this.type == 'ssub'){
		    dim.width = 30;
		    dim.height = 60;
	    }

        return dim;
    }

    completeShape(){
        var color = 'white';

        if(this.type == 'dummy')
	        color = 'black';

	    this.shape.shape.c_svg.setAttribute("fill", color);
	    this.shape.shape.c_svg.setAttribute("stroke-width", "2px");
	    this.shape.shape.vertex.map((v)=>{
	        v.c_svg.setAttribute("fill", 'none');
	    });
	    this.shape.shape.c_points.map((c)=>{
	        c.c_svg.setAttribute("fill", 'none');
	    });


	    if(this.type == 'asub' || this.type == 'ssub'){
	        this.shape.addChild(aya.Rectangle(
		        this.shape.shape.x,
		        this.shape.shape.y,
		        20, 50), {x: 5, y: 5}, null);
	    }else if(this.type == 'clock' || this.type == 'event' || this.type == 'manual'){
	        this.shape.addChild(aya.Image(
		        this.shape.shape.x,
		        this.shape.shape.y,
		        20, 20,
		        this.type=='clock' ? 'src/images/clock.png':
		            this.type=='event' ? 'src/images/clock.png' :
		            'src/images/arrow.png'), {x: 0, y: -25}, null);
	    }

	    if(this.type != 'dummy'){
	        if(this.shape.shape.children.length)
		        this.shape.addChild(
		            aya.Text(this.shape.shape.children[0].child.x,
			                 this.shape.shape.children[0].child.y, this.name),
		            {x: 0, y: -10}, null);
	        else
		        this.shape.addChild(
		            aya.Text(this.shape.shape.x,
			                 this.shape.shape.y, this.name),
		            {x: -aya.config.text.size/2, y: -10}, null);
	    }

    }
    constructor(props={type: 'dummy'}){
	    var state = '';
	    //var color = 'white';
        var dim;

	    if(props && typeof props != 'object')
	        throw new Error('wrong parameter');

	    if(props.name && !props.type){
	        props.type = "dummy";
	    }else if(props.type == "dummy" || props.type == "clock"){
	        if(!props.name)
		        props.name = props.type;
	    }else if(props.type == "manual" || props.type == "automatic" ||
		         props.type == "asub" || props.type == "ssub" || props.type == "event"){
	        if(!props.name)
		        throw new Error("manual transition requires a name");
	    }else
	        throw new Error("wrong transition type");


	    this.state = '';
	    this.type = props.type;
	    this.name = props.name;
        if(!props.app)
            this.app = {};
        else
            this.app = props.app;

        dim = this.getRectDimension();

	    if(!props.x && !props.y){
	        props.x = 0;
	        props.y = 0;
	    }

	    if(props.cWidth && props.cHeight){
	        Transition.centerComponent(props, dim.width, dim.height, props.cWidth, props.cHeight);
	    }

	    this.shape = aya.Component("rectangle", {x:props.x, y:props.y, width: dim.width, height: dim.height});
	    if(this.shape && this.shape.type != 'rectangle')
	        throw new Error("the shape isn't a reectangle");

	    this.completeShape();

	    this.shape.shape.c_svg.addEventListener("mouseover", (e)=>{
	        console.log('mouseover state='+this.state+ ' pos='+this.panelPos);
	        if(this.state == 'moving')
		        return;
	        else if(this.panelPos==undefined || this.panelPos < 0)
	    	    this.addPanel();
	        this.state = 'transition';
	    });

	    this.shape.shape.c_svg.addEventListener("mouseleave", (e)=>{
	        console.log('mouseleave transition');
	        if(this.state == 'moving')
		        return;
	        this.state = '';
	    });

	    this.shape.shape.c_svg.addEventListener("mousedown", (e)=>{
	        var target;
	        console.log('mousedown trans');
	        this.removePanel();
	        this.state = 'moving';

	        if((target=Register.find(this.shape.uuid)))
		        target.onMouseDown();

	    });

	    this.shape.shape.c_svg.addEventListener("mouseup", (e)=>{
	        var target;

	        if(this.state == 'moving')
		        this.state = '';

	        if((target=Register.find(this.shape.uuid)))
		        target.onMouseUp(this.shape.uuid);
	    });

        this.shape.shape.c_svg.addEventListener("click", (e)=>{
	        var target;

	        if((target=Register.find(this.shape.uuid)))
		        target.onclick();
	    });

    }
    redraw(cwidth, cheight){
	    var dx = this.shape.shape.x, dy = this.shape.shape.y;
	    console.log("redraw");
	    console.log(this.shape.shape.x  + " " + this.shape.shape.y);
	    Transition.centerComponent(this.shape.shape, this.shape.shape.width,
	                               this.shape.shape.height, cwidth, cheight);
	    dx = this.shape.shape.x - dx;
	    dy = this.shape.shape.y - dy;
	    console.log(dx + " " + dy);
	    this.shape.shape.children.map(({child})=>{
		    child.shift(dx, dy);
	    });
	    this.shape.shape.redraw();
    }
    
    addPanel(){
	    var x = this.shape.shape.x + this.shape.shape.width;
	    var y = this.shape.shape.y;
	    var wid, hei, panel, img, cp;

	    wid = 2*ImSZ+2*5/*spacing*/;
	    hei = Math.floor(t_actions.length/2);
	    if(t_actions.length % 2)
	        hei++;

	    hei = hei*ImSZ+ hei*5;
	    panel = aya.Rectangle(x, y, wid, hei);

	    this.shape.addChild(panel, {x: -2, y: 0}, null, true);
	    panel.c_svg.setAttribute("stroke-width", "0px");
	    panel.c_svg.setAttribute("opacity", 0);

	    this.panelPos = this.shape.shape.children.length-1;

	    for (var i = 0, j = 0; i < t_actions.length; i++, j++){
	        if (i && !(i%3)){
		        j = 0;
		        y += ImSZ+5/* spacing */;
	        }

	        img = aya.Image(x +ImSZ * j, y, ImSZ, ImSZ,
			                t_actions[i].path, t_actions[i].name);
	        this.shape.addChild(img, {x: 5, y: 0}, null, true);
	        img.c_svg.addEventListener("mouseover", (e)=>{
		        this.state = 'panel';
	        });
	        img.c_svg.addEventListener("mouseleave", (e)=>{
		        this.state = '';
	        });
	        img.c_svg.addEventListener("mousedown", (e)=>{
		        console.log('mousedown image trans');
		        if((cp=Register.find(this.shape.uuid)))
		            cp.addConnector(Transition.path2name(e.target.href.baseVal));
	        });
	    }

	    panel.c_svg.addEventListener("mouseover", (e)=>{
	        console.log('mouseover panel');
	        this.state = 'panel';
	    });
	    panel.c_svg.addEventListener("mouseleave", (e)=>{
	        this.state = '';
	    });

	    this.shape.shape.svg.addEventListener("mouseover", () => {
	        console.log('mouseover svg');
	        if (this.state == '' && this.panelPos >= 0)
		        this.removePanel();
	    });
    }

    removePanel(){
	    var i;
	    for(i = this.panelPos; i <= this.panelPos+t_actions.length; i++)
	        this.shape.shape.children[i].child.removeFromDOM();
	    this.shape.shape.children.splice(this.panelPos, 1+t_actions.length);

	    this.panelPos = -1;
	    this.shape.shape.svg.removeEventListener("mouseover", () => {});
    }
    
    setGate(gate){
	    var index;
	    if(this.gate != 'xor_join' && gate == 'xor_join'){
	        this.shape.addChild(aya.Polyline([this.shape.shape.x, this.shape.shape.y,
					                          this.shape.shape.x-5, this.shape.shape.y,
					                          this.shape.shape.x-5, this.shape.shape.y+this.shape.shape.height,
					                          this.shape.shape.x, this.shape.shape.y+this.shape.shape.height,
					                          this.shape.shape.x-5, this.shape.shape.y+this.shape.shape.height/2,
					                          this.shape.shape.x, this.shape.shape.y]), {x: 0, y: 0}, null);
	        this.shape.shape.redraw();
	    }else if(this.gate == 'xor_join' && gate != 'xor_join'){
	        if(this.type == 'clock' || this.type == 'event' || this.type == 'manual' ||
	           this.type == 'asub' || this.type == 'ssub')
		        index = 2;
	        else if(this.type == 'dummy')
		        index = 0;
	        else
		        index = 1;
	        this.shape.shape.children[index].child.removeFromDOM();
	        this.shape.shape.children.length--;
	    }
	    this.gate = gate;
    }

    setType(type){
        var dim;
        if(this.type == type)
            return;

        this.type = type;
        this.app = {};
        this.shape.shape.children.map(({child})=>{
            child.removeFromDOM();
        })

        this.shape.shape.children.length = 0;
        dim = this.getRectDimension();

        this.shape.shape.width = dim.width;
        this.shape.shape.height = dim.height;

        this.completeShape();

    }
    
    removeFromDOM(){
    }
}
