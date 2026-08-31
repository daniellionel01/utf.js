pub fn main() {
  echo case <<"a":utf8>> {
    <<_:utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<"é":utf8>> {
    <<_:utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<"€":utf8>> {
    <<_:utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<"💜":utf8>> {
    <<_:utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<"ab":utf8>> {
    <<_:utf8, "b":utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<"ab":utf8>> {
    <<"a":utf8, _:utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<"abc":utf8>> {
    <<"a":utf8, _:utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<"abc":utf8>> {
    <<"ab":utf8, _:utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<"aé€💜":utf8>> {
    <<"aé€💜":utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<5:3, "a":utf8>> {
    <<_:size(3), _:utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<5:3, "a":utf8>> {
    <<5:size(3), _:utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<5:3, "💜":utf8>> {
    <<5:size(3), _:utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<"aé€💜":utf8>> {
    <<_:utf8, _:utf8, _:utf8, _:utf8>> -> "match"
    _ -> "no match"
  }

  echo case <<"🇩🇪":utf8>> {
    <<_:utf8, _:utf8>> -> "match"
    _ -> "no match"
  }

  let assert <<prefix:3, x:8, rest:bits>> = <<5:3, 97:8, 21:5>>

  echo case <<5:3, 97:8, 21:5>> {
    <<prefix:3, x:8, rest:bits>> -> "match"
    _ -> "no match"
  }
}
