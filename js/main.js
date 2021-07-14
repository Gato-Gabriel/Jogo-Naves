function start() { // Função de inicialização do jogo
	$("#inicio").hide();   // Esconde o cartaz da tela de início
	
	$("#fundoGame").append("<div id='jogador' class='anima1'></div>");
	$("#fundoGame").append("<div id='inimigo1' class='anima2'></div>");
	$("#fundoGame").append("<div id='inimigo2'></div>");
	$("#fundoGame").append("<div id='amigo' class='anima3'></div>");
    $("#fundoGame").append("<div id='placar'></div>");  // Div na qual são exibidas as informações do jogador
    $("#fundoGame").append("<div id='energia'></div>");  // "Vida" do jogador

    //Principais variáveis do jogo
        
    let jogo = {}
    let TECLA = {
        W: 87,
        S: 83,
        D: 68
    }
    let fimdejogo=false;
    let jogador = { pontos: 0, salvos: 0, perdidos: 0, 
        energiaAtual: 3,
        podeAtirar: true
    };

    let inimigo1 = {  // inimigo1 = Helicóptero
        velocidade: 5,   // Velocidade de 5px por frame
        posicaoY: parseInt(Math.random() * 334)  // Posição inicial do inimigo na tela (escolhida aleatoriamente)
    }

    jogo.pressionou = [];
    $(document).keydown(function(e){  //Verifica se o usuário pressionou alguma tecla	
        jogo.pressionou[e.which] = true;
    });
    $(document).keyup(function(e){
        jogo.pressionou[e.which] = false;
    });

    // Sons
    let somDisparo = document.getElementById("somDisparo");
    let somExplosao = document.getElementById("somExplosao");
    let musica = document.getElementById("musica");
    let somGameover = document.getElementById("somGameover");
    let somPerdido = document.getElementById("somPerdido");
    let somResgate = document.getElementById("somResgate");
    
    //Música em loop
    musica.addEventListener("ended", function(){ musica.currentTime = 0; musica.play(); }, false);  // Quando a música acabar, zerar seu tempo e tocar novamente.
    musica.play();

    //Game Loop
    jogo.timer = setInterval(loop,30);  // Chama a função 'loop' a cada 30 milissegundos
    function loop() {
        movefundo();
        movejogador();
        moveinimigo1();
        moveinimigo2();
        moveamigo();
        detectaColisao();
        placar();
        energia();

    }

    function movefundo() { //Função que movimenta o fundo do jogo
        esquerda = parseInt($("#fundoGame").css("background-position"));   // Pega o valor atual da POSIÇÃO do fundo da div do jogo
        $("#fundoGame").css("background-position",esquerda-1);  // Com isso, a cada loop(30 ms), o fundo se move em 1px;
    }
    function movejogador() {
        if (jogo.pressionou[TECLA.W]) {
            var topo = parseInt($("#jogador").css("top"));
            $("#jogador").css("top",topo-10);   // Diminui 10 unidades de distância do topo da imagem (ou seja, dá a impressão de que ela vai para cima)
            if (topo<=0) {
		        $("#jogador").css("top",topo+10);
            }
        }
        if (jogo.pressionou[TECLA.S]) {
            var topo = parseInt($("#jogador").css("top"));
            $("#jogador").css("top",topo+10);	// Distancia 10 unidades a mais do topo, dando assim a impressão de que a imagem desceu.
            if (topo>=434) {	
                $("#jogador").css("top",topo-10);
            }
        }
        if (jogo.pressionou[TECLA.D]) {
            disparo();
        }
    }
    function moveinimigo1() {
        inimigo1.posicaoX = parseInt($("#inimigo1").css("left"));
        $("#inimigo1").css("left",inimigo1.posicaoX - inimigo1.velocidade);
        $("#inimigo1").css("top",inimigo1.posicaoY);
        if (inimigo1.posicaoX<=0) {  // Ao chegar no final da tela...
            inimigo1.posicaoY = parseInt(Math.random() * 334);
            $("#inimigo1").css("left",694);   // ...o objeto é reposicionado
            $("#inimigo1").css("top",inimigo1.posicaoY);  // ...o objeto é reposicionado
        }
    }
    function moveinimigo2() {
        inimigo1.posicaoX = parseInt($("#inimigo2").css("left"));
        $("#inimigo2").css("left",inimigo1.posicaoX - 3);
        if (inimigo1.posicaoX<=0) {  // Ao chegar no final da tela...
            $("#inimigo2").css("left",775);   // ...o objeto é reposicionado
        }
    }
    function moveamigo() {
        inimigo1.posicaoX = parseInt($("#amigo").css("left"));
        $("#amigo").css("left",inimigo1.posicaoX+1);    // Velocidade de 1px/30ms
        if (inimigo1.posicaoX>906){  // Ao chegar no final da tela...
            $("#amigo").css("left",0);  // ...o objeto é reposicionado
        }
    }
    function disparo() {
	    if (jogador.podeAtirar==true){   // Caso seja possível atirar...
            jogador.podeAtirar=false;    // ...automaticamente impede, para que haja intervalos entre os disparos
            somDisparo.play();
            
            topo = parseInt($("#jogador").css("top"))   // Pega as posições do jogador para que o disparo seja efetuado a partir de seu centro
            inimigo1.posicaoX = parseInt($("#jogador").css("left"))
            tiroX = inimigo1.posicaoX + 190;
            topoTiro = topo+37;
            $("#fundoGame").append("<div id='disparo'></div");
            $("#disparo").css("top",topoTiro);
            $("#disparo").css("left",tiroX);
            
            var tempoDisparo = window.setInterval(executaDisparo, 30);
            
        }
     
        function executaDisparo() {
            inimigo1.posicaoX = parseInt($("#disparo").css("left"));
            $("#disparo").css("left",inimigo1.posicaoX+15); 
            if (inimigo1.posicaoX > 900) {
                window.clearInterval(tempoDisparo);
                tempoDisparo=null;
                $("#disparo").remove();  // Remove da tela o disparo efetuado, e então...
                jogador.podeAtirar=true;   // ...permite que o usuário dispare novamente.
            }
        }
    }
    function detectaColisao() {
        var colisao1 = ($("#jogador").collision($("#inimigo1"))); // jogador com o inimigo1(Helicóptero)
        var colisao2 = ($("#jogador").collision($("#inimigo2"))); // jogador com o inimigo2(Caminhão)
        var colisao3 = ($("#disparo").collision($("#inimigo1"))); // Disparo com o inimigo1(Helicóptero)
        var colisao4 = ($("#disparo").collision($("#inimigo2"))); // Disparo com o inimigo2(Caminhão)
        var colisao5 = ($("#jogador").collision($("#amigo")));   // Jogador com o Amigo
        var colisao6 = ($("#inimigo2").collision($("#amigo")));  // Inimigo2(Caminhão) com o Amigo

        if (colisao1.length>0) {    // Verifica se há alguma colisão (maior que 0 = há alguma). Caso haja...
            inimigo1X = parseInt($("#inimigo1").css("left"));
            inimigo1Y = parseInt($("#inimigo1").css("top"));
            explosao1(inimigo1X,inimigo1Y);   // Posiciona a explosão no local do inimigo
            jogador.energiaAtual--;  // Abaixa a vida do jogador
        
            inimigo1.posicaoY = parseInt(Math.random() * 334);
            $("#inimigo1").css("left",694);
            $("#inimigo1").css("top",inimigo1.posicaoY);   // ...o inimigo é reposicionado
        }
        
        if (colisao2.length>0){  // Jogador com o Inimigo2 
            inimigo2X = parseInt($("#inimigo2").css("left"));
            inimigo2Y = parseInt($("#inimigo2").css("top"));
            explosao2(inimigo2X,inimigo2Y);
            jogador.energiaAtual--;
                    
            $("#inimigo2").remove();
            reposicionaInimigo2();
        }

        if (colisao3.length>0) {  // Disparo com o Inimigo1
            jogador.pontos+=100;
            inimigo1.velocidade+=0.3;   // Aumentar a dificuldade do jogo;
            inimigo1X = parseInt($("#inimigo1").css("left"));
            inimigo1Y = parseInt($("#inimigo1").css("top"));
                
            explosao1(inimigo1X,inimigo1Y);
            $("#disparo").css("left",950);  // Faz com que o disparo não continue correndo após a colisão
                
            inimigo1.posicaoY = parseInt(Math.random() * 334);
            $("#inimigo1").css("left",694);
            $("#inimigo1").css("top",inimigo1.posicaoY);
        }

        if (colisao4.length>0) {  // Disparo com o Inimigo2
            jogador.pontos+=50;
            inimigo2X = parseInt($("#inimigo2").css("left"));
            inimigo2Y = parseInt($("#inimigo2").css("top"));
            $("#inimigo2").remove();
        
            explosao2(inimigo2X,inimigo2Y);
            $("#disparo").css("left",950);
            
            reposicionaInimigo2();
        }

        if (colisao5.length>0) { // Jogador com o Amigo (Resgate)
            jogador.salvos++;
            somResgate.play();
            reposicionaAmigo();
            $("#amigo").remove();
        }

        if (colisao6.length>0) {  //Inimigo2 com o Amigo
            jogador.perdidos++;
            amigoX = parseInt($("#amigo").css("left"));
            amigoY = parseInt($("#amigo").css("top"));
            explosao3(amigoX,amigoY);
            $("#amigo").remove();
                    
            reposicionaAmigo();
        }
    }
    function explosao1(inimigo1X,inimigo1Y) {
        $("#fundoGame").append("<div id='explosao1'></div");
        $("#explosao1").css("background-image", "url(imgs/explosao.png)");
        somExplosao.play();
        var divExplo=$("#explosao1");
        divExplo.css("top", inimigo1Y);
        divExplo.css("left", inimigo1X);
        divExplo.animate({width:200, opacity:0}, "slow");
        // A div de explosão começa com 15 px (vide 'style.css'), e vai aumentando para 200px, enquanto a opacidade vai de 100 a 0%.
        
        var tempoExplosao = window.setInterval(removeExplosao, 1000);  // a função é removida após 1 segundo.
        
        function removeExplosao() {
            divExplo.remove();
            window.clearInterval(tempoExplosao);
            tempoExplosao=null;
        }
    }
    function explosao2(inimigo2X,inimigo2Y) {
	    $("#fundoGame").append("<div id='explosao2'></div");
        $("#explosao2").css("background-image", "url(imgs/explosao.png)");
        somExplosao.play();
        var div2=$("#explosao2");
        div2.css("top", inimigo2Y);
        div2.css("left", inimigo2X);
        div2.animate({width:200, opacity:0}, "slow");
        
        var tempoExplosao2 = window.setInterval(removeExplosao2, 1000);
        
        function removeExplosao2() {
            div2.remove();
            window.clearInterval(tempoExplosao2);
            tempoExplosao2=null;
        }
    }
    function explosao3(amigoX,amigoY) {
        $("#fundoGame").append("<div id='explosao3' class='anima4'></div");
        $("#explosao3").css("top",amigoY);
        $("#explosao3").css("left",amigoX);
        somPerdido.play();
        var tempoExplosao3 = window.setInterval(resetaExplosao3, 1000);
        function resetaExplosao3() {
            $("#explosao3").remove();
            window.clearInterval(tempoExplosao3);
            tempoExplosao3=null;
        }
    }

    function reposicionaInimigo2() {
	    let tempoColisao4 = window.setInterval(reposiciona4, 5000);   // O inimigo só será reposicionado após 5 segundos.
            
        function reposiciona4() {
            window.clearInterval(tempoColisao4);
            tempoColisao4 = null;
            
            if (fimdejogo==false) {   // Só recria o inimigo caso o jogo ainda não tenha acabado
                $("#fundoGame").append("<div id=inimigo2></div");
            }
        }	
    }
    function reposicionaAmigo() {
        var tempoAmigo = window.setInterval(reposiciona6, 6000);   
        
        function reposiciona6() {
            window.clearInterval(tempoAmigo);
            tempoAmigo=null;
            
            if (fimdejogo==false) {  // Caso o jogo ainda não tenha terminado...
                $("#fundoGame").append("<div id='amigo' class='anima3'></div>");  // ...outro amigo é gerado.
            }
        }
    }

    function placar() {
	    $("#placar").html("<h2> Pontos: " + jogador.pontos + " Salvos: " + jogador.salvos + " Perdidos: " + jogador.perdidos + "</h2>");
    }

    function energia() {    // Atualiza os níveis de energia do jogador
        $("#energia").css("background-image", "url(imgs/energia"+jogador.energiaAtual+".png)");
        if(jogador.energiaAtual==0){
            gameOver();
        }
	}
    
    function gameOver() {
        fimdejogo = true;
        musica.pause();
        somGameover.play();
        
        window.clearInterval(jogo.timer);
        jogo.timer = null;
        
        $("#jogador").remove();
        $("#inimigo1").remove();
        $("#inimigo2").remove();
        $("#amigo").remove();
        $("#energia").remove();
        if(jogador.podeAtirar==false) $("#disparo").remove();
        
        $("#fundoGame").append("<div id='fim'></div>");
        
        $("#fim").html("<h1> Game Over </h1><p id='pontuacao'>Sua pontuação foi: <b>" + jogador.pontos + "</b></p>" + "<div id='reinicia' onClick=reiniciaJogo()><h3>Jogar Novamente</h3></div>");
    }
}

function reiniciaJogo() {
	somGameover.pause();
	$("#fim").remove();  // Remove a mensagem de "Game Over"
	start();   // Executa o jogo novamente
}