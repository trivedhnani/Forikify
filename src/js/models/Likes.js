export default class Likes  {
    constructor(){
        this.likes=[];
    }
    addLike(id,title,author,img){
        const like={
            id,
            title,
            author,
            img
        }
        this.likes.push(like);
        this.persistData()
        return like;
    }
    deleteLike(id){
        const index=this.likes.findIndex(el=>el.id===id);
        this.likes.splice(index,1);
        this.persistData();
    }
    isLiked(id){
        return this.likes.findIndex(el=>el.id===id)!==-1;
    }
    getNumLikes(){
        return this.likes.length;
    }
    persistData(){
        // converts object or arrays to strings
        localStorage.setItem('likes',JSON.stringify(this.likes));
    }
    readStorage(){
        // converts strings back to original(object or array) data structures
        const storage=JSON.parse(localStorage.getItem('likes'));
        // restore from local storage
        if(storage){
           this.likes=storage; 
        }
    }
}