use extism_pdk::*;
use fluentci_pdk::dag;

#[plugin_fn]
pub fn init(args: String) -> FnResult<String> {
    let mut tf_version = dag().get_env("TF_VERSION").unwrap_or_default();

    if tf_version.is_empty() {
        tf_version = "latest".to_string();
    }

    let stdout = dag()
        .pipeline("init")?
        .pkgx()?
        .with_exec(vec![
            "pkgx",
            &format!("terraform@{}", tf_version),
            "init",
            &args,
        ])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn validate(args: String) -> FnResult<String> {
    let mut tf_version = dag().get_env("TF_VERSION").unwrap_or_default();

    if tf_version.is_empty() {
        tf_version = "latest".to_string();
    }

    let stdout = dag()
        .pipeline("validate")?
        .pkgx()?
        .with_exec(vec![
            "pkgx",
            &format!("terraform@{}", tf_version),
            "validate",
            &args,
        ])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn plan(args: String) -> FnResult<String> {
    let mut tf_version = dag().get_env("TF_VERSION").unwrap_or_default();

    if tf_version.is_empty() {
        tf_version = "latest".to_string();
    }

    let stdout = dag()
        .pipeline("plan")?
        .pkgx()?
        .with_exec(vec![
            "pkgx",
            &format!("terraform@{}", tf_version),
            "plan",
            &args,
        ])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn apply(args: String) -> FnResult<String> {
    let mut tf_version = dag().get_env("TF_VERSION").unwrap_or_default();

    if tf_version.is_empty() {
        tf_version = "latest".to_string();
    }

    let stdout = dag()
        .pipeline("apply")?
        .pkgx()?
        .with_exec(vec![
            "pkgx",
            &format!("terraform@{}", tf_version),
            "apply",
            &args,
        ])?
        .stdout()?;
    Ok(stdout)
}
