// DİLLERE GÖRE AYRILMIŞ KOD KÜTÜPHANESİ
const CODE_DATABASE = {
  JS: [
    "const sum = (a, b) => a + b;",
    "function greet(name) { return `Hello, ${name}`; }",
    "document.addEventListener('DOMContentLoaded', () => { console.log('Ready!'); });",
    "const filtered = array.filter(item => item.isActive === true);",
    "fetch('https://api.example.com/data').then(res => res.json());",
    "const unique = [...new Set(array)];",
    "const delay = ms => new Promise(res => setTimeout(res, ms));",
    "const randomColor = () => `#${Math.floor(Math.random()*16777215).toString(16)}`;"
  ],
  PY: [
    "def calculate_area(radius): return 3.14 * (radius ** 2)",
    "numbers = [x for x in range(10) if x % 2 == 0]",
    "with open('file.txt', 'r') as file: content = file.read()",
    "class User: def __init__(self, name): self.name = name",
    "print(f'Total score is: {score}')",
    "squared = list(map(lambda x: x**2, numbers))",
    "import random; random_element = random.choice(my_list)",
    "sorted_dict = dict(sorted(my_dict.items(), key=lambda item: item[1]))"
  ],
  CPP: [
    "#include <iostream>\nint main() { std::cout << \"Hello World!\"; return 0; }",
    "for (int i = 0; i < n; i++) { std::vector<int> vec; }",
    "int findMax(int a, int b) { return (a > b) ? a : b; }",
    "std::cout << \"Enter a number: \"; std::cin >> num;",
    "std::unique_ptr<User> user = std::make_unique<User>();",
    "auto result = std::find(vec.begin(), vec.end(), target);",
    "std::sort(arr, arr + n, std::greater<int>());"
  ],
  HTML: [
    "<div class=\"card\" id=\"main-container\"><h1>Title</h1></div>",
    "<button type=\"submit\" onclick=\"handleClick()\">Submit</button>",
    "<input type=\"email\" placeholder=\"Enter your email...\" required />",
    "<link rel=\"stylesheet\" href=\"style.css\" />",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
    "<img src=\"logo.png\" alt=\"Logo\" class=\"responsive-img\" />",
    "<iframe src=\"https://www.youtube.com/embed/xyz\" frameborder=\"0\"></iframe>"
  ],
  CS: [
    "public class Program { public static void Main() { System.Console.WriteLine(\"Hello\"); } }",
    "var filtered = list.Where(x => x.IsActive).OrderBy(x => x.Name).ToList();",
    "public async Task<string> FetchDataAsync() { return await client.GetStringAsync(url); }",
    "int[] numbers = { 1, 2, 3, 4, 5 }; foreach(var n in numbers) { Console.Write(n); }",
    "public string Name { get; set; } = \"Developer\";",
    "using (var connection = new SqlConnection(connString)) { connection.Open(); }",
    "var jsonString = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });"
  ],
  JAVA: [
    "public class Main { public static void main(String[] args) { System.out.println(\"Hello\"); } }",
    "List<String> list = names.stream().filter(n -> n.startsWith(\"A\")).collect(Collectors.toList());",
    "public synchronized void performTask() { System.out.println(\"Running task...\"); }",
    "try (BufferedReader reader = new BufferedReader(new FileReader(\"file.txt\"))) { }",
    "Map<String, Integer> map = new HashMap<>(); map.put(\"score\", 100);",
    "Optional<User> user = userRepository.findById(id); return user.orElseThrow();",
    "@RestController @RequestMapping(\"/api\") public class ApiController { }"
  ]
};
