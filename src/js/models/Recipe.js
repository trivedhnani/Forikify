import axios from 'axios';
export default class Recipe{
    constructor(id){
        this.id=id;
    }
    async getRecipe(){
        try{
            const res=await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title= res.data.recipe.title;
            this.author=res.data.recipe.publisher;
            this.img=res.data.recipe.image_url;
            this.ingredients=res.data.recipe.ingredients;
            this.url=res.data.recipe.source_url;
            // console.log(res);

        }
        catch(error){
            console.log(error);
        }
    }
    calcTime(){
        //for every 3 ingredients 15 min
        const numIng=this.ingredients.length;
        const periods=Math.ceil(numIng/3);
        this.time=periods*15;
    }
    calcServings(){
        this.servings=4;
    }
    parseIngredients(){
        const unitlong=['tablespoons','tablespoon','ounces','ounce','teaspoons','teaspoon','cups','pounds'];
        const unitshort=['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound'];
        const units=[...unitshort,'kg','g'];
        const newIngredients=this.ingredients.map(el=>{
            //uniform units
            let ingredient=el.toLowerCase();
            unitlong.forEach((unit,i)=>{
                ingredient=ingredient.replace(unit,units[i]);
            });

            //Remove parenthesis
            ingredient=ingredient.replace(/ *\([^)]*\) */g, ' '); 
            //parse ingredients into count,unit and name of ingredient
            const arrIng=ingredient.split(' ');
            console.log(arrIng);
            const unitIndex= arrIng.findIndex((el2)=>unitshort.includes(el2));
            // console.log(unitIndex);
            let objIng;
            if(unitIndex>-1){
                //There is a unit
                const arrCount=arrIng.slice(0,unitIndex);
                let count;
                if(arrCount.length===1){
                    count=eval(arrIng[0].replace('-','+'));
                }
                else{
                    count=eval(arrIng.slice(0,unitIndex).join('+'));
                }
                objIng={
                    count,
                    unit:arrIng[unitIndex],
                    ingredient:arrIng.slice(unitIndex+1).join(' ')
                };
            }
            else if(parseInt(arrIng[0],10)){
                //There is no unit but a number is present in 1st position
                objIng={
                    count:parseInt(arrIng[0],10),
                    unit: '',
                    ingredient:arrIng.slice(1).join(' ')
                }
            }
            else if(unitIndex===-1){
                 //There is no unit
                 objIng={
                     count:1,
                     unit:'',
                     ingredient
                 }
            }

            return objIng;
        });
        this.ingredients=newIngredients;
    }
    updateServings(type){
        const newServings= type==='dec'?this.servings-1:this.servings+1;
        this.ingredients.forEach(ing=>{
            ing.count *=(newServings/this.servings);
        });
        this.servings=newServings;  
    }
}