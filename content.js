$(document).ready(() => {
    var repo = getRepoFromPath();
    var key =  "A PRIVATE KEY";
    Promise.resolve().then(()=>{
        var labels = window.localStorage.getItem(repo.username+repo.reponame);
        if(!!labels){
            return JSON.parse(labels);
        }
        return getLabels(key,repo.username,repo.reponame);
    }).then(labels=>{
        window.localStorage.setItem(repo.username+repo.reponame,JSON.stringify(labels));
        console.log("Labels",labels);
        var root = buildHierarchy(labels);
        console.log("Hierarchy",root);
        $(document).find("body").prepend(getTemplate(root,repo)).css("padding-left",300);        
    });
});

function getTemplate(root,repo){
    return `<div id="ghl-container">${getItemTemplate(root,repo)}</div>`
}

function getItemTemplate(item,repo){
    var url = `https://github.com/${repo.username}/${repo.reponame}/issues?q=is%3Aissue+is%3Aopen+label%3A`;
    var tag = `<ul>`;
    for(var i in item){
        if(i == "ref"){
            continue;
        }
        tag += `<li><a href='${url+item[i].ref[0]}'>${i}</a>`
        if(item[i]){
            tag += getItemTemplate(item[i],repo);
        }
        tag += "</li>";

    }
    tag += "</ul>";
    return tag;
}

function buildHierarchy(labels){
    var root = {};
    var currentLevel = root;
    for(var i =0;i<labels.length;i++){
        currentLevel = root;
        var parts = labels[i].split("-");
        for(var j=0;j<parts.length;j++){
            if(!currentLevel[parts[j]]){
                currentLevel[parts[j]] = {ref:[]};
            }
            currentLevel[parts[j]].ref.push(labels[i]);
            currentLevel = currentLevel[parts[j]];
        }
    }
    return root;
}

function getRepoFromPath(){
    const match = window.location.pathname.match(/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/);
    if (!match) {
      return null;
    }

    const username = match[1];
    const reponame = match[2];    
    const repo = {username, reponame};
    return repo;
}

function getLabels(key, owner, repo) {
    return fetch(`https://api.github.com/repos/${owner}/${repo}/labels`, {
            'headers': {
                'Authorization': `token ${key}`
            }
        })
        .then(x => {
            return x.json();
        })
        .then(labels => {
            let names = [];
            labels.forEach(label => {
                names.push(label.name);
            });
            return names;
        });
}