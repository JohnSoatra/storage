function callback(port: number) {
    console.log('running at port:', port);
    
    setInterval(() => {
        listener();
    }, 500);
}

function listener() {
    // working
}

export default callback;