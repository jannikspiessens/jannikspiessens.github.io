function make_stage(nr) {
  $.get('/clear_stages/'+nr.toString()+'.html', function (clear_stage, status, xhr) {
    var arr = clear_stage.split('\n\n');
    sha256(arr[0]).then(function(pass_hash){
      aesGcmEncrypt(arr[1], arr[0]).then(function(encr){

        // save locally (https://gist.github.com/liabru/11263260)
        var blob = new Blob([pass_hash+'\n\n'+encr], { type: 'text/plain' }),
            anchor = document.createElement('a');
        anchor.download = nr.toString() + '.html';
        anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
        anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
        anchor.click();
      });
    });
  });
}
