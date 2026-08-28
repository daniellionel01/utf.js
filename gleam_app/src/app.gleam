pub fn main() {
  echo case <<1>> {
    <<_:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<"a":utf8>> {
    <<_:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }
}
