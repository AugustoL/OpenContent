contract Post {

    address private owner;
    address private index;
    address private tag;
    bytes32 private title;
    bytes32 private image;
    Comments private comments;
    mapping (uint => bytes32) private content;
    uint private block;
    uint private number;
    aArray private up;
    aArray private down;

    struct aArray {
        uint size;
        mapping (uint => address) array;
    }

    struct Comments {
        uint size;
        mapping (uint => Comment) array;
    }

    struct Comment {
        address user;
        uint block;
        bytes32 t1;
        bytes32 t2;
        bytes32 t3;
    }

    function Post(address _owner, address _tag, bytes32 _title, bytes32 _image, bytes32 c1, bytes32 c2, bytes32 c3, bytes32 c4, bytes32 c5, bytes32 c6, bytes32 c7, bytes32 c8) {
        owner = address(_owner);
        index = address(msg.sender);
        tag = address(_tag);
        title = _title;
        image = _image;
        content[0] = c1;
        content[1] = c2;
        content[2] = c3;
        content[3] = c4;
        content[4] = c5;
        content[5] = c6;
        content[6] = c7;
        content[7] = c8;
        comments = Comments(0);
        up = aArray(0);
        down = aArray(0);
    }

    function setIds(uint _number, uint _block){
        number = _number;
        block = _block;
    }

    function getData() constant returns (address, address, bytes32, bytes32, uint, uint, uint, uint, uint) {
        return (owner, tag, title, image, comments.size, up.size, down.size, block, number);
    }

    function getContent() constant returns (bytes32, bytes32, bytes32, bytes32, bytes32, bytes32, bytes32, bytes32) {
        return (content[0], content[1], content[2], content[3], content[4], content[5], content[6], content[7]);
    }

    function getComment(uint index) constant returns (address, uint, bytes32, bytes32, bytes32) {
        if (index < comments.size)
            return (comments.array[index].user, comments.array[index].block, comments.array[index].t1, comments.array[index].t2, comments.array[index].t3);
        return( 0x0, 0, "", "", "");
    }

    function destroy() {
        if ((index != address(msg.sender)) && (owner == address(tx.origin))) suicide(owner);
    }

    function addComment(address _user, uint _block, bytes32 _t1, bytes32 _t2, bytes32 _t3) constant returns (bool) {
        if (index != address(msg.sender))
            return false;
        comments.array[comments.size] = Comment({
            user : _user,
            block : _block,
            t1 : _t1,
            t2 : _t2,
            t3 : _t3
        });
        comments.size ++;
        return true;
    }

    function giveUp() constant returns (bool){
        if (index != address(msg.sender))
                return false;
        for(uint i = 0; i < up.size; i ++)
            if (up.array[i] == address(tx.origin))
                return false;
        up.array[up.size] = address(tx.origin);
        up.size ++;
        return true;
    }

    function giveDown() constant returns (bool){
        if (index != address(msg.sender))
                return false;
        for(uint i = 0; i < down.size; i ++)
            if (down.array[i] == address(tx.origin))
                return false;
        down.array[down.size] = address(tx.origin);
        down.size ++;
        return true;
    }

    function getOwner() constant returns (address) {
        return address(owner);
    }

}

contract Tag {

    address private owner;
    address private index;
    bytes32 private name;
    aArray private posts;
    aArray private users;

    struct aArray {
        uint size;
        mapping (uint => address) array;
    }

    function Tag(address _owner, bytes32 _name) {
        name = _name;
        index = address(msg.sender);
        owner = address(_owner);
        posts = aArray(0);
        users = aArray(0);
    }

    function destroy() {
        if ((index != address(msg.sender)) && (owner == address(tx.origin))) suicide(owner);
    }

    function getName() constant returns (bytes32) {
        return name;
    }

    function getInfo() constant returns (bytes32, uint, uint) {
        return (name, posts.size, users.size);
    }

    function getOwner() constant returns (address) {
        return address(owner);
    }

    function getPost(uint i) constant returns (address) {
        if (i < posts.size)
            return (posts.array[i]);
        return 0x0;
    }

    function getUser(uint i) constant returns (address) {
        if (index != address(msg.sender))
            return 0x0;
        if (i < users.size)
            return (users.array[i]);
        return 0x0;
    }

    function addPost(address new_post_address, address author) constant returns (bool) {
        if (index == address(msg.sender))
            for( uint i = 0; i < users.size; i ++)
                if (users.array[i] == author) {
                    posts.array[posts.size] = new_post_address;
                    posts.size ++;
                    return true;
                }
        return false;
    }

    function removePost(address post_address) constant returns (bool) {
        if (index != address(msg.sender))
            return false;
        for( uint i = 0; i < posts.size; i ++)
            if (posts.array[i] == post_address) {
                if (i == (posts.size-1)){
                    delete posts.array[i];
                } else {
                    for( uint z = i + 1; z < posts.size; z ++){
                        posts.array[z-1] = posts.array[z];
                        z ++;
                    }
                    delete posts.array[posts.size-1];
                }
                posts.size --;
                return true;
            }
        return false;
    }

    function addUser(address new_user_address) constant returns (bool) {
        if (index != address(msg.sender))
            return false;
        users.array[users.size] = new_user_address;
        users.size ++;
        return true;
    }

    function removeUser(address user_address) constant returns (bool) {
        if (index != address(msg.sender))
            return false;
        for( uint i = 0; i < users.size; i ++)
            if (users.array[i] == user_address) {
                if (i == (users.size-1))
                    delete users.array[i];
                else {
                    for( uint z = i + 1; z < users.size; z ++)
                        users.array[z-1] = users.array[z];
                    delete users.array[users.size-1];
                }
                users.size --;
                return true;
            }
        return false;
    }

}

contract User {

    address private owner;
    address private index;
    bytes32 private email;
    bytes32 private username;
    bytes32 private name;
    bytes32 private imageurl;
    bytes10 private birth;
    bytes32 private location;
    bytes32 private url1;
    bytes32 private url2;
    aArray private tags;
    aArray private posts;

    struct aArray {
        uint size;
        mapping (uint => address) array;
    }

    function User(address _owner, bytes32 _email, bytes32 _username, bytes32 _name, bytes32 _imageurl,bytes10 _birth, bytes32 _location, bytes32 _url1, bytes32 _url2) {
        owner = address(_owner);
        index = address(msg.sender);
        email = _email;
        username = _username;
        name = _name;
        imageurl = _imageurl;
        birth = _birth;
        location = _location;
        url1 = _url1;
        url2 = _url2;
        tags = aArray(0);
        posts = aArray(0);
    }

    function edit(bytes32 _name, bytes32 _email, bytes32 _imageurl, bytes10 _birth, bytes32 _location, bytes32 _url1, bytes32 _url2) constant returns ( bool ) {
        if ((owner != address(address(tx.origin))) || (index != address(msg.sender)))
            return false;
        name = _name;
        email = _email;
        imageurl = _imageurl;
        birth = _birth;
        location = _location;
        url1 = _url1;
        url2 = _url2;
        return true;
    }

    function addTag(address tag_address) constant returns ( bool ) {
        if ((owner != address(tx.origin)) || (index != address(msg.sender)))
            return false;
        for(uint i = 0; i < tags.size; i ++)
            if (tags.array[i] == tag_address)
                return false;
        tags.array[tags.size] = tag_address;
        tags.size ++;
        return true;
    }

    function getTag(uint i) constant returns (address) {
        if (i < tags.size)
            return (tags.array[i]);
        return 0x0;
    }

    function getPost(uint i) constant returns (address) {
        if (i < posts.size)
            return (posts.array[i]);
        return 0x0;
    }

    function removeTag(address tag_address) constant returns ( bool ) {
        if ((owner != address(tx.origin)) || (index != address(msg.sender)))
            return false;
        for( uint i = 0; i < tags.size; i ++)
            if ((tags.array[i] == tag_address) && (Tag(tags.array[i]).getOwner() == address(tx.origin))) {
                if (i == (tags.size-1)){
                    delete tags.array[i];
                } else {
                    for( uint z = i; z < tags.size; z ++)
                        tags.array[z] = tags.array[z+1];
                    delete tags.array[tags.size-1];
                }
                tags.size --;
                return true;
            }
        return false;
    }

    function insertPost(address post_address) constant returns (bool) {
        if (index == address(msg.sender)){
            posts.array[posts.size] = post_address;
            posts.size ++;
            return true;
        }
        return false;
    }

    function removePost(address post_address) constant returns (bool) {
        if ((address(tx.origin) != Post(post_address).getOwner()) || (owner != tx.origin) || (index != address(msg.sender)))
            return false;
        for( uint i = 0; i < posts.size; i ++)
            if ((posts.array[i] == post_address) && (Post(posts.array[i]).getOwner() == address(tx.origin))) {
                if (i == (posts.size-1)){
                    Post(posts.array[i]).destroy();
                    delete posts.array[i];
                } else {
                    for( uint z = i; z < posts.size; z ++)
                        posts.array[z] = posts.array[z+1];
                    Post(posts.array[posts.size-1]).destroy();
                    delete posts.array[posts.size-1];
                }
                posts.size --;
                return true;
            }
        return false;
    }

    function destroy () {
        if ((owner != address(tx.origin)) || (index != address(msg.sender)))
            suicide(owner);
    }

    function getUsername() constant returns (bytes32) {
        return username;
    }

    function getData() constant returns (address, bytes32, bytes32, uint, uint) {
        return (address(this), username, name, uint(tags.size), uint(posts.size));
    }

    function getProfile() constant returns (address, bytes32, bytes32, bytes32, bytes32, bytes10, bytes32, bytes32, bytes32) {
        return (address(this), username, name, email, location, birth, imageurl, url1, url2);
    }

    function getOwner() constant returns (address) {
        return owner;
    }

}

contract OpenContentIndex {

    bytes32 constant version = "0.1.0";

    aArray private tags;
    aArray private users;
    aArray private posts;

    struct aArray {
        uint size;
        mapping (uint => address) array;
    }

    event log (bytes32 message);
    event logAddress (address message);
    event logInt (uint message);

    function OpenContentIndex() {
        users = aArray(0);
        tags = aArray(0);
        posts = aArray(0);
        log("Created");
    }

    function getIndexInfo()constant returns (bytes32, uint, uint, uint) {
        return (version, users.size, tags.size, posts.size);
    }

/*--------------------------------------------- TAGS ---------------------------------------------*/

    function createTag( bytes32 new_tag_name ) constant returns (bool) {
        log('Creating tag..');
        for( uint i = 0; i < tags.size; i ++)
            if (Tag(tags.array[i]).getName() == bytes32(new_tag_name))
                return false;
        for(uint z = 0; z < users.size; z ++)
            if (User(users.array[z]).getOwner() == address(tx.origin)){
                Tag newTag = new Tag(address(tx.origin), new_tag_name);
                newTag.addUser(address(tx.origin));
                tags.array[tags.size] = address(newTag);
                tags.size ++;
                User(users.array[z]).addTag(address(newTag));
                log('Created !');
                return true;
            }
        return false;
    }

    function deleteTag(address tag_address) constant returns ( bool ) {
        if (address(tx.origin) != Tag(tag_address).getOwner())
            return false;
        log("Removing Tag");
        for( uint i = 0; i < tags.size; i ++)
            if ((tags.array[i] == tag_address) && (Tag(tags.array[i]).getOwner() == address(tx.origin))) {
                if (i == (tags.size-1)){
                    Tag(tags.array[i]).destroy();
                    delete tags.array[i];
                    log("Removed last");
                } else {
                    for( uint z = i; z < tags.size; z ++)
                        tags.array[z] = tags.array[z+1];
                    Tag(tags.array[tags.size-1]).destroy();
                    delete tags.array[tags.size-1];
                    log("Removed middle");
                }
                tags.size --;
                return true;
            }
        return false;
    }

    function getTagInfo(address tag_address) constant returns (bytes32, uint, uint) {
        for( uint i = 0; i < tags.size; i ++)
            if ( address(tags.array[i]) == tag_address )
                return Tag(tags.array[i]).getInfo();
        return ("", 0, 0);
    }

/*--------------------------------------------- USERS ---------------------------------------------*/

    function createUser(bytes32 _email, bytes32 _username, bytes32 _name, bytes32 _imageurl, bytes10 _birth, bytes32 _location, bytes32 _url1, bytes32 _url2) constant returns (bool){
        log("Adding user to index");
        for( uint i = 0; i < users.size; i ++)
            if ((User(users.array[i]).getUsername() == _username) || (User(users.array[i]).getOwner() == address(tx.origin)))
                return false;
        users.array[users.size] = new User(address(tx.origin), _email, _username, _name, _imageurl, _birth, _location, _url1, _url2 );
        users.size ++;
        log(_username);
        return false;
    }

    function editUser(bytes32 _name, bytes32 _email, bytes32 _imageurl, bytes10 _birth, bytes32 _location, bytes32 _url1, bytes32 _url2) returns (bool) {
        log("Editing user");
        for( uint i = 0; i < users.size; i ++)
            if (User(users.array[i]).getOwner() == address(tx.origin)) {
                User(users.array[i]).edit(_name, _email, _imageurl, _birth, _location, _url1, _url2);
                return true;
            }
        return false;
    }

    function addTagOnUser(address tag_address) returns (bool) {
        log("Adding tag on user");
        for( uint i = 0; i < users.size; i ++)
            if (User(users.array[i]).getOwner() == address(tx.origin))
                if (Tag(tag_address).addUser(tx.origin))
                    return User(users.array[i]).addTag(tag_address);
        return false;
    }

    function removeTagOnUser(address tag_address) returns (bool) {
        log("Removing tag on user");
        for( uint i = 0; i < users.size; i ++)
            if (User(users.array[i]).getOwner() == address(tx.origin))
                if (Tag(tag_address).removeUser(address(tx.origin)))
                    return User(users.array[i]).removeTag(tag_address);
        return false;
    }

    function deleteUser() constant returns (bool) {
        log("Removing user");
        for( uint i = 0; i < users.size; i ++)
            if ((users.array[i] == address(tx.origin)) && (User(users.array[i]).getOwner() == address(tx.origin))) {
                if (i == (users.size-1)){
                    User(users.array[i]).destroy();
                    delete users.array[i];
                    log("Removed last");
                } else {
                    for( uint z = i; z < users.size; z ++)
                        users.array[z] = users.array[z+1];
                    User(users.array[users.size-1]).destroy();
                    delete users.array[users.size-1];
                    log("Removed middle");
                }
                users.size --;
                return true;
            }
        return false;
    }

    function getUserByUsername(bytes32 username) constant returns (address) {
        for( uint i = 0; i < users.size; i ++)
            if ( User(users.array[i]).getUsername() == username )
                return User(users.array[i]);
        return (0x0);
    }

    function getUserByAddress(address _owner) constant returns (address) {
        for( uint i = 0; i < users.size; i ++)
            if ( User(users.array[i]).getOwner() == _owner )
                return User(users.array[i]);
        return (0x0);
    }

/*--------------------------------------------- POSTS ---------------------------------------------*/

    function getHomePost(uint i) constant returns (address) {
        if (i < posts.size)
            return posts.array[i];
        return (0x0);
    }

    function addComment(address post_address, bytes32 t1, bytes32 t2, bytes32 t3) constant returns (bool) {
        log("Adding comment");
        for( uint z = 0; z < users.size; z ++)
            if (User(users.array[z]).getOwner() == address(tx.origin))
                for( uint i = 0; i < posts.size; i ++)
                    if (posts.array[i] == post_address){
                        Post(posts.array[i]).addComment(address(tx.origin), block.number, t1, t2, t3);
                        return true;
                    }
        return false;
    }

    function createPost(address _tag, bytes32 _title, bytes32 _image, bytes32 c1, bytes32 c2, bytes32 c3, bytes32 c4, bytes32 c5, bytes32 c6, bytes32 c7, bytes32 c8) returns (bool) {
        log("Adding post on user 0");
        for( uint i = 0; i < users.size; i ++){
            if (User(users.array[i]).getOwner() == address(tx.origin)){
                for( uint z = 0; z < tags.size; z ++){
                    if (tags.array[z] == address(_tag)){
                        log("Adding post on user 1");
                        Post newPost = new Post(address(tx.origin), tags.array[z], _title, _image, c1, c2, c3, c4, c5, c6, c7, c8);
                        newPost.setIds(posts.size, block.number);
                        Tag(tags.array[z]).addPost(address(newPost), address(tx.origin));
                        User(users.array[i]).insertPost(address(newPost));
                        posts.array[posts.size] = address(newPost);
                        posts.size ++;
                        log("ADDED !!");
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function deletePost(address post_address, address tag_address) returns (bool) {
        log("Removing post on user");
        for( uint i = 0; i < posts.size; i ++)
            if ((posts.array[i] == post_address) && (Post(posts.array[i]).getOwner() == address(tx.origin)))
                for( uint z = 0; z < users.size; z ++)
                    if (User(users.array[z]).getOwner() == address(tx.origin)){
                        Tag(tag_address).removePost(post_address);
                        User(users.array[z]).removePost(post_address);
                        delete posts.array[i];
                        posts.size --;
                        return true;
                    }
        return false;
    }

}
