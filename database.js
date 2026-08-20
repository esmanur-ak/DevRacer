// DİLLERE GÖRE AYRILMIŞ VE ZORLUK DERECELERİNE GÖRE DÜZENLENMİŞ KOD KÜTÜPHANESİ
const CODE_DATABASE = {
  JS: {
    easy: [
      "const sum = (a, b) => a + b;",
      "let isActive = true;",
      "const greeting = 'Hello World';",
      "console.log('Ready to race!');",
      "const numbers = [1, 2, 3, 4, 5];",
      "const unique = [...new Set(array)];",
      "const first = arr[0];",
      "const double = x => x * 2;"
    ],
    medium: [
      "function greet(name) { return `Hello, ${name}`; }",
      "const filtered = array.filter(item => item.isActive === true);",
      "const delay = ms => new Promise(res => setTimeout(res, ms));",
      "const randomColor = () => `#${Math.floor(Math.random()*16777215).toString(16)}`;",
      "const isEven = num => num % 2 === 0;",
      "const max = Math.max(...numbers);",
      "const serialized = JSON.stringify({ id: 1, name: 'DevRacer' });",
      "const obj = Object.assign({}, defaults, options);"
    ],
    hard: [
      "document.addEventListener('DOMContentLoaded', () => { console.log('Ready!'); });",
      "fetch('https://api.example.com/data').then(res => res.json()).catch(err => console.error(err));",
      "const fibonacci = n => n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);",
      "const debounce = (func, wait) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait); }; };",
      "const deepClone = obj => JSON.parse(JSON.stringify(obj));",
      "const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);",
      "const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));"
    ]
  },
  PY: {
    easy: [
      "print('Hello, DevRacer!')",
      "x = [1, 2, 3, 4, 5]",
      "total = sum(numbers)",
      "is_valid = True",
      "name = input('Enter name: ')",
      "names.append('John')",
      "value = my_dict.get('key', 0)",
      "print(f'Score: {score}')"
    ],
    medium: [
      "def calculate_area(radius): return 3.14 * (radius ** 2)",
      "numbers = [x for x in range(10) if x % 2 == 0]",
      "class User: def __init__(self, name): self.name = name",
      "squared = list(map(lambda x: x**2, numbers))",
      "import random; random_element = random.choice(my_list)",
      "formatted_date = datetime.now().strftime('%Y-%m-%d')",
      "def get_user_status(user): return 'Active' if user.is_active else 'Inactive'",
      "filtered_data = {k: v for k, v in data.items() if v > 10}"
    ],
    hard: [
      "with open('file.txt', 'r') as file: content = file.read()",
      "sorted_dict = dict(sorted(my_dict.items(), key=lambda item: item[1]))",
      "def decorator(func): def wrapper(*args, **kwargs): return func(*args, **kwargs); return wrapper",
      "async def fetch_data(url): async with aiohttp.ClientSession() as session: return await session.get(url)",
      "class Singleton: _instance = None; def __new__(cls): if not cls._instance: cls._instance = super().__new__(cls); return cls._instance",
      "matrix = [[row * col for col in range(5)] for row in range(5)]",
      "generator_expr = (x**2 for x in range(100) if x % 3 == 0)"
    ]
  },
  CPP: {
    easy: [
      "int a = 5; int b = 10;",
      "std::cout << \"Hello World!\";",
      "int arr[5] = {1, 2, 3, 4, 5};",
      "double area = width * height;",
      "bool flag = false;",
      "char grade = 'A';",
      "std::string name = \"Coder\";"
    ],
    medium: [
      "int findMax(int a, int b) { return (a > b) ? a : b; }",
      "std::cout << \"Enter a number: \"; std::cin >> num;",
      "for (int i = 0; i < n; i++) { std::vector<int> vec; }",
      "auto result = std::find(vec.begin(), vec.end(), target);",
      "struct Point { int x; int y; }; Point p1 = {10, 20};",
      "class Circle { public: double radius; double getArea() { return 3.14 * radius * radius; } };",
      "enum class Color { Red, Green, Blue }; Color c = Color::Red;"
    ],
    hard: [
      "#include <iostream>\nint main() { std::cout << \"Hello World!\"; return 0; }",
      "std::unique_ptr<User> user = std::make_unique<User>();",
      "std::sort(arr, arr + n, std::greater<int>());",
      "template <typename T> T myMax(T x, T y) { return (x > y)? x: y; }",
      "std::vector<std::shared_ptr<Widget>> widgets; for(auto& w : widgets) { w->draw(); }",
      "auto lam = [](int x, int y) -> bool { return x + y > 10; };",
      "class ThreadSafeQueue { private: std::mutex mtx; std::queue<int> q; public: void push(int val) { std::lock_guard<std::mutex> lock(mtx); q.push(val); } };"
    ]
  },
  HTML: {
    easy: [
      "<h1>Title</h1>",
      "<p>Welcome to DevRacer!</p>",
      "<a href=\"https://github.com\">GitHub</a>",
      "<button class=\"btn\">Click Me</button>",
      "<img src=\"logo.png\" alt=\"Logo\" />",
      "<span class=\"badge\">10</span>",
      "<strong>Important text</strong>"
    ],
    medium: [
      "<input type=\"email\" placeholder=\"Enter your email...\" required />",
      "<link rel=\"stylesheet\" href=\"style.css\" />",
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
      "<div class=\"card\" id=\"main-container\"><h1>Title</h1></div>",
      "<button type=\"submit\" onclick=\"handleClick()\">Submit</button>",
      "<ul class=\"list-group\"><li class=\"list-item\">Item 1</li></ul>",
      "<nav class=\"navbar\"><div class=\"nav-brand\">DevRacer</div></nav>"
    ],
    hard: [
      "<img src=\"logo.png\" alt=\"Logo\" class=\"responsive-img\" />",
      "<iframe src=\"https://www.youtube.com/embed/xyz\" frameborder=\"0\"></iframe>",
      "<form action=\"/submit\" method=\"POST\"><input type=\"text\" name=\"user\" /><input type=\"password\" name=\"pass\" /><button type=\"submit\">Login</button></form>",
      "<svg height=\"100\" width=\"100\"><circle cx=\"50\" cy=\"50\" r=\"40\" stroke=\"black\" stroke-width=\"3\" fill=\"red\" /></svg>",
      "<audio controls><source src=\"horse.ogg\" type=\"audio/ogg\"><source src=\"horse.mp3\" type=\"audio/mpeg\">Your browser does not support the audio element.</audio>",
      "<video width=\"320\" height=\"240\" controls><source src=\"movie.mp4\" type=\"video/mp4\"></video>",
      "<table class=\"table\"><thead><tr><th>Name</th><th>Score</th></tr></thead><tbody><tr><td>Player 1</td><td>120</td></tr></tbody></table>"
    ]
  },
  CS: {
    easy: [
      "int a = 10; int b = 20;",
      "Console.WriteLine(\"Hello from C#!\");",
      "bool isCompleted = false;",
      "string title = \"DevRacer\";",
      "int[] nums = new int[] { 1, 2, 3 };",
      "var today = DateTime.Today;",
      "double temp = 36.6;"
    ],
    medium: [
      "public string Name { get; set; } = \"Developer\";",
      "int[] numbers = { 1, 2, 3, 4, 5 }; foreach(var n in numbers) { Console.Write(n); }",
      "var filtered = list.Where(x => x.IsActive).OrderBy(x => x.Name).ToList();",
      "var person = (Name: \"Alice\", Age: 25); Console.WriteLine(person.Name);",
      "public enum Level { Easy, Medium, Hard } Level l = Level.Medium;",
      "try { ProcessData(); } catch (Exception ex) { Log(ex.Message); }",
      "var scores = new Dictionary<string, int>() { { \"Alice\", 95 }, { \"Bob\", 88 } };"
    ],
    hard: [
      "public class Program { public static void Main() { System.Console.WriteLine(\"Hello\"); } }",
      "public async Task<string> FetchDataAsync() { return await client.GetStringAsync(url); }",
      "using (var connection = new SqlConnection(connString)) { connection.Open(); }",
      "var jsonString = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });",
      "public class BaseRepository<T> where T : class, new() { private readonly DbContext _context; }",
      "Func<int, int, int> add = (x, y) => x + y; int res = add(3, 4);",
      "public static IEnumerable<int> GetEvenNumbers(IEnumerable<int> src) { foreach(var val in src) { if (val % 2 == 0) yield return val; } }"
    ]
  },
  JAVA: {
    easy: [
      "int sum = 10 + 20;",
      "System.out.println(\"Java Race!\");",
      "boolean isReady = true;",
      "String username = \"Player1\";",
      "int[] scores = {10, 20, 30};",
      "double pi = 3.14159;",
      "char symbol = '$';"
    ],
    medium: [
      "Map<String, Integer> map = new HashMap<>(); map.put(\"score\", 100);",
      "public synchronized void performTask() { System.out.println(\"Running task...\"); }",
      "List<String> list = names.stream().filter(n -> n.startsWith(\"A\")).collect(Collectors.toList());",
      "public String getStatus(int val) { return val > 50 ? \"PASS\" : \"FAIL\"; }",
      "class Rectangle { private int w, h; public Rectangle(int w, int h) { this.w = w; this.h = h; } }",
      "LocalDate date = LocalDate.now(); System.out.println(date.toString());",
      "int val = Integer.parseInt(\"123\");"
    ],
    hard: [
      "public class Main { public static void main(String[] args) { System.out.println(\"Hello\"); } }",
      "try (BufferedReader reader = new BufferedReader(new FileReader(\"file.txt\"))) { }",
      "Optional<User> user = userRepository.findById(id); return user.orElseThrow();",
      "@RestController @RequestMapping(\"/api\") public class ApiController { }",
      "public class ThreadPoolManager { private final ExecutorService executor = Executors.newFixedThreadPool(10); }",
      "List<User> users = session.createQuery(\"FROM User WHERE active = true\", User.class).list();",
      "CompletableFuture.supplyAsync(() -> fetchUrl()).thenAccept(content -> process(content));"
    ]
  }
};
