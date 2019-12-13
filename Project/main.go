package main
 
import (
	"github.com/gorilla/mux"
	"net/http"
	"fmt"
	"time"
	"io/ioutil"
	"encoding/json"
	"bytes"
	"github.com/boltdb/bolt"
	"log"
	"strings"
)


func main()  {
	Router := mux.NewRouter()
	
	Router.PathPrefix("/css/").Handler(http.StripPrefix("/css/",http.FileServer(http.Dir("css"))))
	Router.PathPrefix("/js/").Handler(http.StripPrefix("/js/",http.FileServer(http.Dir("js"))))
	Router.PathPrefix("/imgs/").Handler(http.StripPrefix("/imgs/",http.FileServer(http.Dir("imgs"))))
	
	//配置路由
	Router.HandleFunc("/information",getresults).Methods("POST") 
	Router.HandleFunc("/transaction",transaction).Methods("POST")
	Router.HandleFunc("/addAccount",addAccount).Methods("POST")
	Router.HandleFunc("/getAddress",getAddress).Methods("POST")
	Router.HandleFunc("/",Hello).Methods("GET")
	//设置端口 路由
	server := http.Server{
		Addr:":8080",
		ReadTimeout:time.Second,
		WriteTimeout:time.Second,
		Handler:Router,
	}
	//启动监听
	server.ListenAndServe()

}

func Hello(w http.ResponseWriter,r *http.Request){
	w.Header().Set("Content-Type","text/html;charset=utf-8")
	file,_:=ioutil.ReadFile("index.html")
	fmt.Fprintln(w,string(file))
	w.Header()
}
 
//对与前端发送来的transaction(post)请求的处理
func getresults(w http.ResponseWriter,r *http.Request)  {
	//参数解析
	body,_ := ioutil.ReadAll(r.Body)
	fmt.Println(string(body))
	var info string =Get(string(body))
	fmt.Println(info)
	w.Write([]byte(info))
}
 
//对与前端发送来的transaction(post)请求的处理
func transaction(w http.ResponseWriter,r *http.Request)  {
	//参数解析
	w.Header().Set("Access-Control-Allow-Origin", "*")
	body,_ := ioutil.ReadAll(r.Body)
	fmt.Println(string(body))
	var information string= Post("http://localhost:5002/WeBASE-Front/trans/handle",body,"application/json")
	fmt.Println(information)
	w.Write([]byte(information))
}

func addAccount(w http.ResponseWriter,r *http.Request){

	
	body,_ := ioutil.ReadAll(r.Body)
	var params map[string]string
	json.Unmarshal(body, &params)
	fmt.Println(params["name"])
	fmt.Println(params["assets"])
	var info string =Get("http://localhost:5002/WeBASE-Front/privateKey?useAes=false&userName="+params["name"])
	fmt.Println(info)
	
	var temp []byte = []byte(info)
	var data map[string]string
	json.Unmarshal(temp, &data)
	//fmt.Println(data["publicKey"])
	

	table:="companyAddress"
	key:=data["userName"]
	value:=data["address"]
	dbInsert(table,key,value)

	res:="{\""+data["userName"]+"\":\""+data["address"]+"\"}"
	fmt.Println(res)
	w.Write([]byte(res))
}

func getAddress(w http.ResponseWriter,r *http.Request){
	// body,_ := ioutil.ReadAll(r.Body)
	table:="companyAddress"
	w.Write([]byte(scan(table)))
}

//向链段发送POST请求
func Post(url string, data []byte, contentType string) string {
    req, err := http.NewRequest(`POST`, url, bytes.NewBuffer(data))
    req.Header.Add(`content-type`, contentType)
    if err != nil {
        panic(err)
    }
    defer req.Body.Close()

    client := &http.Client{Timeout: 5 * time.Second}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    result, _ := ioutil.ReadAll(resp.Body)
    return string(result)
}

//向链段发送GET请求
func Get(url string)string{
	resp, err := http.Get(url)
    if err != nil {
        fmt.Println(err)
        return "error"
    }
    defer resp.Body.Close()
    body, err := ioutil.ReadAll(resp.Body)
	return string(body)
}

// 数据库
// 插入
func dbInsert(table string,key string,value string){
	db, err := bolt.Open("zwk.db", 0600, nil)
    if err != nil {
        log.Fatal(err)
	}
	db.Update(func(tx *bolt.Tx) error {	b,err:=tx.CreateBucketIfNotExists([]byte(table))
		if err!=nil{
			return  err
		}
		err = b.Put([]byte(key), []byte(value))
		return err
	})
	defer db.Close()
}


//遍历
func scan(table string)string{
	fmt.Println("scan_begin***********************")
	db, err := bolt.Open("zwk.db", 0600, nil)
    if err != nil {
        log.Fatal(err)
	}
	var result string
	db.View(func(tx *bolt.Tx) error {
		// Assume bucket exists and has keys
		b,err:=tx.CreateBucketIfNotExists([]byte(table))
		if err!=nil{
			return  err
		}

		c := b.Cursor()
		result="{"
		for k, v := c.First(); k != nil; k, v = c.Next() {
			fmt.Printf("key=%s, value=%s\n", k, v)
			result=result+"\""+string(k)+"\":\""+string(v)+"\","
		}
		result=strings.Trim(result,",")
		result=result+"}"
		return nil
	})
	defer db.Close()
	fmt.Println("scan_end***********************")
	return result
}