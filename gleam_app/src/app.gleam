pub fn main() {
  echo case <<"a":utf8>> {
    <<_:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<"é":utf8>> {
    <<_:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<"€":utf8>> {
    <<_:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<"💜":utf8>> {
    <<_:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<"ab":utf8>> {
    <<_:utf8, "b":utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<"ab":utf8>> {
    <<"a":utf8, _:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<"abc":utf8>> {
    <<"a":utf8, _:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<"abc":utf8>> {
    <<"ab":utf8, _:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<"aé€💜":utf8>> {
    <<"aé€💜":utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<5:3, "a":utf8>> {
    <<_:size(3), _:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<5:3, "a":utf8>> {
    <<5:size(3), _:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<5:3, "💜":utf8>> {
    <<5:size(3), _:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }

  echo case <<"aé€💜":utf8>> {
    <<_:utf8, _:utf8, _:utf8, _:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }
}
