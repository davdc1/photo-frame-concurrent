

// let bigCookie = document.getElementById('bigCookie')
// let clickInterval


// bigCookie.onclick = () => Game.ClickCookie()


// function start () {
//     clickInterval = setInterval(() => bigCookie.click(), 5)
// }

// function stop () {
//     clearInterval(clickInterval)
// }



// let clickShimmerInterval
// function startClickShimmer() {
//     clickShimmerInterval = setInterval(() => {
//         let items = [...document.getElementsByClassName('shimmer')]
//         items.forEach((item) => {
//             console.log('click shimmer');
//             item?.click()
//         })
//     }, 500)
// }

// function stopClickShimmer() {
//     clearInterval(clickShimmerInterval)
// }



// let autoAppeasementInterval

// function autoAppeasement () {
//         let yy = [...test2].find(({ dataset }) => dataset.id == 74)
//         yy.click()
//     autoAppeasementinterval = setInterval(() => {
//         let yy = [...test2].find(({ dataset }) => dataset.id == 74)
//         yy.click()
//     }, 18000000)

// }

// function stopAutoAppeasement () {
//     clearInterval(autoAppeasementinterval)
// }

// // // autoAppeasement()


// let clickTickerInterval

// function startClickTicker() {
//     clickTickerInterval = setInterval(() => {
//         if (Game.TickerEffect && Game.TickerEffect.type == 'fortune') {
//             let el = document.getElementById('commentsText1')
//             el.click()
//             console.log('Ticker Clicked');
//         }
//     }, 800)
// }

// function stopClickTicker() {
//     clearInterval(clickTickerInterval)
// }



// let buySellInterval
// function startBuySell() {
//     let product3 = document.getElementById('product3')
//     let product4 = document.getElementById('product4')

//     let set100 = document.getElementById('storeBulk100')

//     let sellButton = document.getElementById('storeBulkSell')
//     let buyButton = document.getElementById('storeBulkBuy')

//     buySellInterval = setInterval(() => {
//         set100.click()
//         sellButton.click()
//         for (let i = 0; i < 8; i++) {
//             product3.click()
//             product4.click()
//         }

//         set100.click()
//         buyButton.click()
//         for (let i = 0; i < 8; i++) {
//             product3.click()
//             product4.click()
//         }

//     }, 10500)

// }

// function stopBuySell() {
//     clearInterval(buySellInterval)
// }


// startClickTicker()
// start()
// startClickShimmer()
// // startBuySell()









// // let goldenInterval

// // function startGoldenCycle () {
// //     goldenInterval = setInterval(() => {
// //         new Game.shimmer('golden');
// //         new Game.shimmer('golden');
// //         new Game.shimmer('golden');
// //         new Game.shimmer('golden');
// //         new Game.shimmer('golden');

// //         let items = [...document.getElementsByClassName('shimmer')]
// //         setTimeout(() => {
// //             items.forEach((item) => item.click())
// //         }, 1000)

// //     }, 1000)
// // }

// // function StopGoldenCycle () {
// //     clearInterval(goldenInterval)
// // }













function costByTens(iterations, startPrice) {
    let array = [startPrice]

    for (let i = 0; i < iterations - 1; i++) {
        array.push(array[i] * 4.045)
    }

    let sum = array.reduce((prev, cur) => {
        return prev + cur
    })

    // console.log(array);
    console.log('sum', sum.toLocaleString());
}

// costByTens(5, 70.31)




function costByTens2(iterations, startPrice) {
    let sum = startPrice
    for(let i = 1; i < iterations; i++) {
        sum += Math.pow(4.045, i) * startPrice
    }
    console.log('total', sum.toLocaleString());
}

// costByTens2(7, 74.809)




function doit () {
    let array =
    [0, 1, 3, 0, 4, 6, 0, 0, 5, 3, 0]
    // [1, 3, 0, 4]
    // [1, 3, ]


    // let spaceCount = 0
    // for (let i = 0; i < array.length; i++) {
    //     if (array[i] == 0) {
    //         spaceCount++
    //     }

    //     for (let j = 0; j < spaceCount; j++) {

    //     }

    // }


    for (let i = 0; i < array.length; i++) {
        if (array[i] == 0) {
            for (let j = i; j < array.length; j++) {
                
                if (typeof array[j + 1] == 'number') array[j] = array[j + 1]
                // array[j] = array[j + 1]
            }
        }
        
    }

    console.log(array);


}

// doit()




// console.log('lolololololol');

// let i = 0
// let start = new Date().getTime()
// while (i < 1000000) {
//     i++
//     let one = Math.random(), two = Math.random()
//     console.log(one * two);
// }
// let end = new Date().getTime()

// console.log('diff', end - start);










const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time))


let array = []

async function roll() {
    console.log('hello');
    // await delay(3000)
    // console.log('ggggg');

    let run = true
    while (array.length < 1) {
        console.log('1');
    }

}

function fill() {
    setInterval(() => {
        console.log('push');
        array.push(1)
    }, 2000)
}

// fill()

// setTimeout(roll, 0)


// roll()


console.log(323/18);
