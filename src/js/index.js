import Search from './models/Search';
import * as searchview from './view/searchView';
import * as recipeview from './view/recipeView';
import List from './models/List';
import * as listview from './view/listView';
import {elements,renderLoader,clearLoader} from './view/base';
// import Reccipe from './models/Recipe';
import Recipe from './models/Recipe';
import Likes from './models/Likes';
import * as likesView from './view/likesView';
// Golabal State of our app
const state={};

const controlSearch= async ()=>{
    // 1. Get query from view
    const query=searchview.getInput();
    console.log(query);
    if(query){
        // 2.new seacrch object and add to state
        state.search=new Search(query);
        // 3. Prep UI&Update UI  
        searchview.clearInput();
        searchview.clearResults();
        renderLoader(elements.searchRes);
        // Search for recipes since the search returns a promise we want to display ui only after the exection of promise
        // One way of dioing that is asyn await
        try{
            await state.search.getResults(); 
    
            // Render results
            // console.log(state.search.results);
            clearLoader();
            searchview.renderRecipies(state.search.results);
        }
        // elements.searchResPages.insertAdjacentElement()
        catch(err){
            clearLoader();
            alert('error processing the search');
        }
    }
};
elements.searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click',e=>{
    const btn=e.target.closest('.btn-inline');
    const goToPage=parseInt(btn.dataset.goto,10);
    searchview.clearResults();
    searchview.renderRecipies(state.search.results,goToPage);
    // console.log(goToPage);
});
// Recipe controller
const controlRecipe= async ()=>{
    //get id from URL
    const id=window.location.hash.replace('#','');
    if(id){
        //Prepare for UI changes
        recipeview.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected recipe
        if(state.search)
        searchview.highlightselected(id);
        //Create new recipe object
        state.recipe=new Recipe(id);
        //get recipe data
        try{
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            // calculate  servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            //render recipe
            clearLoader();
            recipeview.renderRecipe(state.recipe,state.likes.isLiked(state.recipe.id));
        }
        catch(error){
            alert(`error processing recipe: ${error}`);
        }
    }
    console.log(id); 
};
// window.addEventListener('hashchange',controlRecipe);
['hashchange','load'].forEach((event)=>{
    window.addEventListener(event,controlRecipe);
});
window.addEventListener('load',(e)=>{
    // on load create a new list
    state.likes=new Likes();
    // read data from local storage
    state.likes.readStorage();
    // toggle likes menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render existing likes
    state.likes.likes.forEach(like=>likesView.renderLike(like));
});

const controlList=()=>{
    //Create a new list if there is no list
    if(!state.list)state.list=new List();

    //add each ingridient to list and user interface
    state.recipe.ingredients.forEach(el=>{
        const item=state.list.addItem(el.count,el.unit,el.ingredient);
        listview.renderItem(item);
    });
};
elements.shopping.addEventListener('click',(e)=>{
    const id=e.target.closest('.shopping__item').dataset.itemid;
    //handle delete item
    // console.log(id);
    if(e.target.matches('.shopping__delete,.shopping__delete *')){
        //delete from list module and UI
        state.list.deleteItem(id);
        listview.deleteItem(id);
    }
    else if(e.target.matches('.shopping__count-value')){
        const val= parseFloat(e.target.value,10);
        if(val>0){
        state.list.updateCount(id,val);
        }
    }
});
const controlLike=()=>{
    
    const currId=state.recipe.id;
    if(!state.likes.isLiked(currId)){
        //create a new Like
        const newLike=state.likes.addLike(
            currId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
            //toggle likes button
            likesView.toggleLikeButton(true);
            //add to list
            likesView.renderLike(newLike);
    }
    else{
        state.likes.deleteLike(currId);
        likesView.toggleLikeButton(false);
        likesView.deleteLike(currId);   
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};
//Handling recipe button
elements.recipe.addEventListener('click',(e)=>{
    if(e.target.matches('.btn-decrease,.btn-decrease *') && state.recipe.servings>1){
        state.recipe.updateServings('dec');
        recipeview.updateServingsIngredients(state.recipe);
    }
    else if(e.target.matches('.btn-increase,.btn-increase *')){
        state.recipe.updateServings('inc');
        recipeview.updateServingsIngredients(state.recipe);
    }
    else if(e.target.matches('.recipe__btn-add','.recipe__btn-add *')){
        controlList();
    }
    else if(e.target.matches('.recipe__love, .recipe__love *')){
        //Like controller
        controlLike();
    }
});